import { Observable } from 'rxjs';

const myObs$ = new Observable((observer) => {
  let count = 0;
  const interval = setInterval(() => {
    observer.next(`Current time: ${new Date().getTime()}`);
    console.log(`Observables count: ${count}`);
    count++;

    if (count === 3) {
      // error
      observer.error('Error');
    }

    if (count === 10) {
      clearInterval(interval);
      observer.complete();
    }
  }, 1000);

  return () => {
    // cleanup
    clearInterval(interval);
  };
});

let countReceived = 0;

const sub = myObs$.subscribe({
  next: (value) => {
    console.log(`myObs$ says: `, value);
    countReceived++;
    if (countReceived === 5) {
      sub.unsubscribe();
    }
  },
  complete: () => {
    console.log(`myObs$ completed`);
  },
  error: (error) => {
    console.error(error);
  }
});
