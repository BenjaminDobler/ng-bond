import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, signal, TemplateRef } from '@angular/core';
import { Link, NgBondService } from '../../services/ngbond.service';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { SelectionManager } from '../../services/selection.manager';
import { KeyManager } from '../../services/key.manager';
import { makeDraggable } from '../util/drag.util';
import { contains, touches } from '../../utils/geo.utils';
@Component({
  selector: 'ng-bond-world',
  imports: [NgTemplateOutlet, DecimalPipe],
  templateUrl: './ng-bond-world.component.html',
  styleUrl: './ng-bond-world.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
  host: {
    '(click)': 'onClick($event)',
  },
})
export class NgBondWorld {
  public el: ElementRef<HTMLElement> = inject(ElementRef);
  protected dragService: NgBondService = inject(NgBondService);
  protected selectionManager: SelectionManager = inject(SelectionManager);
  public pathanimation = input<TemplateRef<unknown>>();
  private keymanager: KeyManager = inject(KeyManager);

  animationBubbleCount = input<number>(10);
  animationBubbleDuration = input<number>(4);

  startP = signal<{ x: number; y: number } | null>(null);
  endP = signal<{ x: number; y: number } | null>(null);

  selectionRect = computed(() => {
    const start = this.startP();
    const end = this.endP();
    if (!start || !end) {
      return null;
    }
    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    };
  });

  ngAfterViewInit() {
    const drag = makeDraggable(this.el.nativeElement);

    drag.dragStart$.subscribe((evt) => {
      this.wasDrag = true;
      this.startP.set({ x: evt.offsetX, y: evt.offsetY });
    });

    drag.dragMove$.subscribe((evt) => {
      this.endP.set({ x: evt.startOffsetX + evt.deltaX, y: evt.startOffsetY + evt.deltaY });
      const r = this.selectionRect();
      if (r) {
        // const targets = this.dragService.dragElements().filter((t) => {
        //   const c = contains({ x1: r?.x, y1: r.y, x2: r.x + r.width, y2: r.y + r.height }, { x1: t.gX(), y1: t.gY(), x2: t.gX() + t.width(), y2: t.gY() + t.height() });
        //   return c && t.type === 'container';
        // });

        const targets = this.dragService.dragElements().filter((t) => {
          const c = touches({ x1: r?.x, y1: r.y, x2: r.x + r.width, y2: r.y + r.height }, { x1: t.gX(), y1: t.gY(), x2: t.gX() + t.width(), y2: t.gY() + t.height() });
          return c && t.type === 'container';
        });

        this.selectionManager.setAll(targets);
      }
    });

    drag.dragEnd$.subscribe((evt) => {
      evt.originalEvent.preventDefault();
      evt.originalEvent.stopPropagation();

      this.endP.set(null);
      this.startP.set(null);
    });
  }

  onConnectionClick(link: Link) {
    console.log('Connection clicked', link);
  }

  protected countToArray(count: number) {
    return Array(count).fill(0);
  }

  wasDrag = false;
  onClick(evt: MouseEvent) {
    if (this.wasDrag) {
      this.wasDrag = false;
      return;
    }
    // this.selectionManager.unselectAll();

    let hasComponent = false;
    let target = evt.target as HTMLElement;
    while (target && target !== this.el.nativeElement) {
      const targetComp = this.dragService.getComponent(target);
      if (targetComp) {
        // If the target is a component, do not unselect
        hasComponent = true;
        break;
      }
      target = target.parentElement as HTMLElement;
    }
    if (!hasComponent) {
      console.log('NO COMPONENT FOUND, UNSELECTING');
      this.selectionManager.unselectAll();
    }
  }
}
