"""NetScope database models and SQLite initialization."""
import hashlib
import hmac
import os
import sqlite3
from datetime import datetime, timezone

import bcrypt
from sqlalchemy import Column, DateTime, Float, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(254), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="NOC Security Analyst")
    is_verified = Column(Integer, default=0, nullable=False)
    email_verification_token_hash = Column(String(64), nullable=True)
    email_verification_expires_at = Column(DateTime, nullable=True)
    password_reset_token_hash = Column(String(64), nullable=True)
    password_reset_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "isVerified": bool(self.is_verified),
            "createdAt": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "lastLogin": self.last_login.strftime("%Y-%m-%d %H:%M:%S") if self.last_login else None,
        }


class FlowRecordModel(Base):
    __tablename__ = "flow_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    src_ip = Column(String(50), nullable=False)
    src_port = Column(Integer, nullable=False)
    dst_ip = Column(String(50), nullable=False)
    dst_port = Column(Integer, nullable=False)
    protocol = Column(String(20), nullable=False)
    packets = Column(Integer, default=1)
    bytes_transferred = Column(Integer, default=64)
    duration_sec = Column(Float, default=0.1)
    status = Column(String(20), default="ESTABLISHED")
    created_at = Column(DateTime, default=utcnow)


DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "netscope.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def hash_password(password: str) -> str:
    """Hash a password with bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("ascii")


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify bcrypt hashes and safely upgrade legacy PBKDF2 hashes on login."""
    try:
        if stored_hash.startswith("$2"):
            return bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("ascii"))

        salt, key_hex = stored_hash.split(":", 1)
        test_key = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000
        )
        return hmac.compare_digest(test_key.hex(), key_hex)
    except (ValueError, TypeError, UnicodeError):
        return False


def init_db():
    Base.metadata.create_all(bind=engine)
    with sqlite3.connect(DB_PATH) as conn:
        columns = {row[1] for row in conn.execute("PRAGMA table_info(users)")}
        is_legacy_auth_schema = "email_verification_token_hash" not in columns
        duplicate_emails = conn.execute(
            "SELECT lower(trim(email)), COUNT(*) FROM users "
            "GROUP BY lower(trim(email)) HAVING COUNT(*) > 1 LIMIT 1"
        ).fetchone()
        if duplicate_emails:
            raise RuntimeError(
                "Cannot normalize duplicate user email addresses in the existing database."
            )
        migrations = {
            "is_verified": "INTEGER NOT NULL DEFAULT 0",
            "email_verification_token_hash": "VARCHAR(64)",
            "email_verification_expires_at": "DATETIME",
            "password_reset_token_hash": "VARCHAR(64)",
            "password_reset_expires_at": "DATETIME",
            "updated_at": "DATETIME",
            "last_login": "DATETIME",
        }
        for column, definition in migrations.items():
            if column not in columns:
                conn.execute(f"ALTER TABLE users ADD COLUMN {column} {definition}")

        conn.execute("UPDATE users SET email = lower(trim(email))")
        if is_legacy_auth_schema:
            # Previous "verified" flags were based on exposed demo OTPs, not email ownership.
            cleanup_columns = ["is_verified = 0"]
            if "verification_code" in columns:
                cleanup_columns.append("verification_code = NULL")
            if "verification_expires_at" in columns:
                cleanup_columns.append("verification_expires_at = NULL")
            conn.execute(f"UPDATE users SET {', '.join(cleanup_columns)}")
        conn.execute(
            "UPDATE users SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)"
        )
        conn.execute(
            "CREATE TABLE IF NOT EXISTS auth_rate_limits ("
            "rate_key TEXT PRIMARY KEY, window_start REAL NOT NULL, attempts INTEGER NOT NULL)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_window "
            "ON auth_rate_limits(window_start)"
        )
        conn.commit()
