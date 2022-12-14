import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable, of } from 'rxjs';
import {
  delay,
  exhaustMap,
  map,
  retry,
  share,
  switchMap,
  take,
  tap,
  timeout
} from 'rxjs/operators';
import { Toolbelt } from './internals';
import { Todo, TodoApi } from './models';
import { TodoSettings } from './todo-settings.service';

const todosUrl = 'http://localhost:3333/api';

function fib(n: number): number {
  return n < 3 ? 1 : fib(n - 1) + fib(n - 2);
}

@Injectable()
export class TodoService {
  constructor(
    private http: HttpClient,
    private toolbelt: Toolbelt,
    private settings: TodoSettings
  ) {}

  loadFrequently(): Observable<Todo[]> {
    // TODO: Introduce error handled, configured, recurring, all-mighty stream

    return this.settings.settings$.pipe(
      switchMap((settings) => {
        if (settings.isPollingEnabled) {
          return interval(settings.pollingInterval ?? 5000).pipe(
            exhaustMap(() => this.query())
          );
        } else {
          return this.query();
        }
      }),
      tap({ error: () => this.toolbelt.offerHardReload() }),
      share(),
      retry({
        count: 5,
        delay: (error, n) => of(null).pipe(delay(fib(n) * 1000), take(1))
      })
    ); // current value, and subsequent values
  }

  private query(): Observable<Todo[]> {
    return this.http
      .get<TodoApi[]>(`${todosUrl}`)
      .pipe(
        map((todosFromApi) =>
          todosFromApi.map((todoFromApi) => this.toolbelt.toTodo(todoFromApi))
        )
      );
    // TODO: Apply mapping to fix display of tasks
  }

  create(todo: Todo): Observable<TodoApi> {
    return this.http.post<TodoApi>(todosUrl, todo);
  }

  remove(todoForRemoval: TodoApi): Observable<Todo> {
    return this.http
      .delete<TodoApi>(`${todosUrl}/${todoForRemoval.id}`)
      .pipe(map((todo) => this.toolbelt.toTodo(todo)));
  }

  completeOrIncomplete(todoForUpdate: Todo): Observable<Todo> {
    const updatedTodo = this.toggleTodoState(todoForUpdate);
    return this.http
      .put<TodoApi>(
        `${todosUrl}/${todoForUpdate.id}`,
        this.toolbelt.toTodoApi(updatedTodo)
      )
      .pipe(map((todo) => this.toolbelt.toTodo(todo)));
  }

  private toggleTodoState(todoForUpdate: Todo): Todo {
    todoForUpdate.isDone = todoForUpdate.isDone ? false : true;
    return todoForUpdate;
  }
}
