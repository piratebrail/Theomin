import { Task, TaskId } from '@/types/task';

export function topologicalSort(tasks: Task[]): TaskId[] {
  const graph = new Map<TaskId, TaskId[]>();
  const inDegree = new Map<TaskId, number>();
  
  // Construir grafo
  for (const task of tasks) {
    graph.set(task.id, []);
    inDegree.set(task.id, 0);
  }
  
  for (const task of tasks) {
    for (const depId of task.dependsOn) {
      if (graph.has(depId)) {
        graph.get(depId)!.push(task.id);
        inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1);
      }
    }
  }
  
  // BFS (Kahn's algorithm)
  const queue: TaskId[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }
  
  const result: TaskId[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);
    
    for (const neighbor of graph.get(current) || []) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }
  
  if (result.length < tasks.length) {
    throw new Error('Dependência circular detectada!');
  }
  
  return result;
}
