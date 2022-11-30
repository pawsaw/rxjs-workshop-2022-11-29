import { Component, OnInit } from '@angular/core';
import {
  combineLatest,
  combineLatestWith,
  first,
  map,
  mapTo,
  merge,
  Observable,
  of,
  share,
  skip,
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

    this.show$ = this.todosSource$.pipe(skip(1), mapTo(true));
    this.hide$ = this.update$$.pipe(mapTo(false));

    this.showReload$ = merge(this.show$, this.hide$);

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
