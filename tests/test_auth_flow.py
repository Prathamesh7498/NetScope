import sys
import unittest
import uuid
from pathlib import Path
from unittest.mock import patch

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT.parent))

from netscope.database.models import SessionLocal, UserModel, utcnow  # noqa: E402
from netscope.server import app as server_module  # noqa: E402


class AuthWorkflowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = server_module.app
        cls.app.config["JWT_SECRET"] = "test-only-signing-secret-with-adequate-length"
        cls.app.config["COOKIE_SECURE"] = False

    def setUp(self):
        self.email = f"auth-test-{uuid.uuid4().hex}@example.test"
        self.client_ip = f"test-client-{uuid.uuid4().hex}"
        self.sent_tokens = {}
        self.delivery = patch.object(
            server_module,
            "_send_auth_email",
            side_effect=lambda email, name, token, purpose: self.sent_tokens.update(
                {purpose: token}
            ),
        )
        self.delivery.start()
        self.addCleanup(self.delivery.stop)
        self.client = self.app.test_client()
        self.addCleanup(self.remove_test_user)

    def remove_test_user(self):
        db = SessionLocal()
        try:
            db.query(UserModel).filter(UserModel.email == self.email).delete()
            db.commit()
        finally:
            db.close()

    def json_post(self, path, body):
        return self.client.post(
            path, json=body, environ_base={"REMOTE_ADDR": self.client_ip}
        )

    def test_registration_verification_login_logout_and_password_reset(self):
        response = self.json_post("/api/auth/register", {
            "name": "Auth Test User",
            "email": f" {self.email.upper()} ",
            "password": "a-secure-test-password",
            "confirmPassword": "a-secure-test-password",
        })
        self.assertEqual(response.status_code, 201)
        self.assertNotIn("token", response.json)
        self.assertNotIn("code", response.json)
        code = self.sent_tokens["verify"]
        self.assertRegex(code, r"^\d{6}$")

        db = SessionLocal()
        try:
            user = db.query(UserModel).filter(UserModel.email == self.email).one()
            self.assertFalse(user.is_verified)
            self.assertTrue(user.password_hash.startswith("$2"))
            self.assertNotEqual(user.email_verification_token_hash, self.sent_tokens["verify"])
        finally:
            db.close()

        login = self.json_post("/api/auth/login", {
            "email": self.email,
            "password": "a-secure-test-password",
        })
        self.assertEqual(login.status_code, 403)
        self.assertEqual(login.json["error"], "Please verify your email before logging in.")
        self.assertEqual(self.client.get("/api/packets").status_code, 401)

        verified = self.json_post("/api/auth/verify-email", {
            "email": self.email,
            "code": "000000" if code != "000000" else "000001",
        })
        self.assertEqual(verified.status_code, 400)
        verified = self.json_post("/api/auth/verify-email", {"email": self.email, "code": code})
        self.assertEqual(verified.status_code, 200)
        reused = self.json_post("/api/auth/verify-email", {"email": self.email, "code": code})
        self.assertEqual(reused.status_code, 400)

        login = self.json_post("/api/auth/login", {
            "email": self.email,
            "password": "a-secure-test-password",
        })
        self.assertEqual(login.status_code, 200)
        self.assertTrue(login.headers.get("Set-Cookie", "").startswith("netscope_access="))
        self.assertIn("HttpOnly", login.headers["Set-Cookie"])
        self.assertEqual(self.client.get("/api/auth/me").status_code, 200)
        self.assertEqual(self.client.get("/api/packets").status_code, 200)

        self.assertEqual(self.json_post("/api/auth/logout", {}).status_code, 200)
        self.assertEqual(self.client.get("/api/packets").status_code, 401)

        reset_request = self.json_post("/api/auth/forgot-password", {"email": self.email})
        self.assertEqual(reset_request.status_code, 200)
        expired_reset_token = self.sent_tokens["reset"]
        db = SessionLocal()
        try:
            user = db.query(UserModel).filter(UserModel.email == self.email).one()
            from datetime import timedelta
            user.password_reset_expires_at = utcnow() - timedelta(seconds=1)
            db.commit()
        finally:
            db.close()
        self.assertEqual(self.json_post("/api/auth/reset-password", {
            "token": expired_reset_token,
            "password": "a-new-secure-password",
            "confirmPassword": "a-new-secure-password",
        }).status_code, 400)
        self.assertEqual(
            self.json_post("/api/auth/forgot-password", {"email": self.email}).status_code,
            200,
        )
        reset_token = self.sent_tokens["reset"]
        reset = self.json_post("/api/auth/reset-password", {
            "token": reset_token,
            "password": "a-new-secure-password",
            "confirmPassword": "a-new-secure-password",
        })
        self.assertEqual(reset.status_code, 200)
        self.assertEqual(self.json_post("/api/auth/reset-password", {
            "token": reset_token,
            "password": "another-new-password",
            "confirmPassword": "another-new-password",
        }).status_code, 400)

        self.assertEqual(self.json_post("/api/auth/login", {
            "email": self.email,
            "password": "a-secure-test-password",
        }).status_code, 401)
        self.assertEqual(self.json_post("/api/auth/login", {
            "email": self.email,
            "password": "a-new-secure-password",
        }).status_code, 200)

    def test_login_rate_limit(self):
        body = {"email": self.email, "password": "incorrect-password"}
        for _ in range(5):
            self.assertEqual(self.json_post("/api/auth/login", body).status_code, 401)
        limited = self.json_post("/api/auth/login", body)
        self.assertEqual(limited.status_code, 429)
        self.assertIn("Retry-After", limited.headers)

    def test_expired_verification_token_can_only_be_replaced_by_resend(self):
        registered = self.json_post("/api/auth/register", {
            "name": "Auth Test User",
            "email": self.email,
            "password": "a-secure-test-password",
            "confirmPassword": "a-secure-test-password",
        })
        self.assertEqual(registered.status_code, 201)
        old_code = self.sent_tokens["verify"]
        db = SessionLocal()
        try:
            user = db.query(UserModel).filter(UserModel.email == self.email).one()
            from datetime import timedelta
            user.email_verification_expires_at = utcnow() - timedelta(seconds=1)
            db.commit()
        finally:
            db.close()

        self.assertEqual(
            self.json_post("/api/auth/verify-email", {"email": self.email, "code": old_code}).status_code,
            400,
        )
        resent = self.json_post("/api/auth/resend-verification", {"email": self.email})
        self.assertEqual(resent.status_code, 200)
        self.assertNotEqual(old_code, self.sent_tokens["verify"])
        self.assertEqual(
            self.json_post("/api/auth/verify-email", {
                "email": self.email,
                "code": self.sent_tokens["verify"],
            }).status_code,
            200,
        )


if __name__ == "__main__":
    unittest.main()
