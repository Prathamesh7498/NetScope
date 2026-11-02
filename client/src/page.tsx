import React, { useEffect, useState } from 'react';
import { createClient } from './utils/supabase/client';

export default function Page() {
  const [todos, setTodos] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function loadTodos() {
      const { data } = await supabase.from('todos').select();
      if (data) setTodos(data);
    }
    loadTodos();
  }, []);

  return (
    <ul className="p-4 space-y-2 text-white">
      {todos?.map((todo: any) => (
        <li key={todo.id} className="p-2 bg-[#0F172A] rounded border border-[#1E293B]">
          {todo.name}
        </li>
      ))}
    </ul>
  );
}
