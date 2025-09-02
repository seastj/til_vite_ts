import { supabase } from '../lib/supabase';
import type { Todo, TodoInsert, TodoUpdate } from '../types/TodoTypes';

// Todo 목록 조회
export const getTodos = async (): Promise<Todo[] | undefined> => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      // 실행은 되었지만 결과가 오류이다.
      throw new Error(`getTodos 오류 : ${error.message}`);
    }
    return data || [];
  } catch (error) {
    console.log(error);
  }
};
// Todo 생성
export const createTodo = async (newTodo: TodoInsert): Promise<Todo | null> => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .insert([{ ...newTodo, completed: false }])
      .select()
      .single();
    if (error) {
      // 실행은 되었지만 결과가 오류이다.
      throw new Error(`createTodos 오류 : ${error.message}`);
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
// Todo 수정
export const updateTodo = async (id: number, editTitle: TodoUpdate): Promise<Todo | null> => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .update({ ...editTitle, updated_at: new Date().toISOString() })
      .eq('id', id)
      .single();
    if (error) {
      // 실행은 되었지만 결과가 오류이다.
      throw new Error(`updateTodos 오류 : ${error.message}`);
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
// Todo 삭제
export const deleteTodo = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) {
      // 실행은 되었지만 결과가 오류이다.
      throw new Error(`deleteTodos 오류 : ${error.message}`);
    }
  } catch (error) {
    console.log(error);
  }
};
// Completed Toggle
export const toggleTodo = async (id: number, completed: boolean): Promise<Todo | null> => {
  return updateTodo(id, { completed });
};
