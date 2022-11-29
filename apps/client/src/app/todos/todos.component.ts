import { Component, OnInit } from '@angular/core';
import {
  combineLatest,
  combineLatestWith,
  first,
  map,
  merge,
  Observable,
  of,
  share,
  Subject,
  tap,
  withLatestFrom
} from 'rxjs';
import { Todo } from './models';
import { TodoService } from './todo.service';

@Component({
  selector: 'dos-todos',
  templateUrl: './todos.component.html'
})
export class TodosComponent implements OnInit {
  todos$: Observable<Todo[]>;
  todosSource$ = this.todosService.loadFrequently();
  todosInitial$: Observable<Todo[]>;
  todosMostRecent$: Observable<Todo[]>;

  update$$ = new Subject();
  show$: Observable<boolean>;
  hide$: Observable<boolean>;
  showReload$: Observable<boolean> = of(true);

  constructor(private todosService: TodoService) {}

  ngOnInit(): void {
    this.todosInitial$ = this.todosSource$.pipe(first());

    const latestTodos$ = this.update$$.pipe(
      withLatestFrom(this.todosSource$),
      map(([_, todos]: [unknown, Todo[]]) => todos)
    );

    this.todos$ = merge(this.todosInitial$, latestTodos$).pipe(
      tap(console.log),
      share()
    );
  }

  completeOrIncompleteTodo(todoForUpdate: Todo) {
    /*
     * Note in order to keep the code clean for the workshop we did not
     * handle the following subscription.
     * Normally you want to unsubscribe.
     *
     * We just want to focus you on RxJS.
     */
    this.todosService.completeOrIncomplete(todoForUpdate).subscribe();
  }
}
