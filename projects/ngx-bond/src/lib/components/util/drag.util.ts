import { fromEvent, race, last, map, share, startWith, switchMap, take, takeUntil, tap } from 'rxjs';

const mouseMove$ = fromEvent<PointerEvent>(document, 'pointermove').pipe(share());
const mouseUp$ = fromEvent<PointerEvent>(document, 'pointerup').pipe(share());

export function makeDraggable(element: HTMLElement) {
  const mouseDown$ = fromEvent<PointerEvent>(element, 'pointerdown').pipe(
    tap((e: PointerEvent) => {
      if (!(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }),
    map((evt) => {
      const rect = element.getBoundingClientRect();
      const offsetX = evt.pageX - rect.left;
      const offsetY = evt.pageY - rect.top;

      return {
        pageY: evt.pageY,
        pageX: evt.pageX,
        offsetX,
        offsetY,
        calcOffsetX: offsetX,
        calcOffsetY: offsetY,
        target: element,
      };
    }),
    share()
  );

  const dragStart$ = mouseDown$.pipe(
    switchMap((start) =>
      mouseMove$
        .pipe(
          map((moveEvent) => {
            console.log('Drag start', start.offsetX);
            return {
              ...start,
              ...moveEvent,
              offsetX: start.offsetX,
              offsetY: start.offsetY,
            };
          }),
          take(1)
        )
        .pipe(takeUntil(mouseUp$))
    ),
    share()
  );

  const dragMove$ = dragStart$.pipe(
    switchMap((start: any) =>
      mouseMove$.pipe(
        map((moveEvent) => {
          return {
            originalEvent: moveEvent,
            deltaX: moveEvent.pageX - start.pageX,
            deltaY: moveEvent.pageY - start.pageY,
            startOffsetX: start.offsetX,
            startOffsetY: start.offsetY,
          };
        }),
        takeUntil(mouseUp$)
      )
    ),
    share()
  );

  const dragEnd$ = dragStart$.pipe(
    switchMap((start) =>
      mouseMove$.pipe(
        startWith(start),
        map((moveEvent) => ({
          originalEvent: moveEvent,
          deltaX: moveEvent.pageX - start.pageX,
          deltaY: moveEvent.pageY - start.pageY,
          startOffsetX: start.offsetX,
          startOffsetY: start.offsetY,
        })),
        takeUntil(mouseUp$),
        last()
      )
    )
  );

  // Create a click event that is emitted when the mouse is released without moving
  const click$ = mouseDown$.pipe(switchMap((start) => mouseUp$.pipe(takeUntil(mouseMove$))));

  return { dragStart$, dragMove$, dragEnd$, click$: click$ };
}
