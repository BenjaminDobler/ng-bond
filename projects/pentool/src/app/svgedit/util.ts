import { Point } from './point';

export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
    const a = p1.x - p2.x;
    const b = p1.y - p2.y;

    const c = Math.sqrt(a * a + b * b);
    return c;
}

export function getAngle(p1: { x: number; y: number }, p2: { x: number; y: number }) {
    let angle = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    return angle;
}


export function isInWhichSegment(pathElement: any, x: number, y: number) {
    var seg;
    // You get get the coordinates at the length of the path, so you
    // check at all length point to see if it matches
    // the coordinates of the click
    const len = pathElement.getTotalLength();
    for (var i = 0; i < len; i++) {
        var pt = pathElement.getPointAtLength(i);
        // you need to take into account the stroke width, hence the +- 2
        if (pt.x < x + 2 && pt.x > x - 2 && pt.y > y - 2 && pt.y < y + 2) {
            seg = pathElement.getPathSegAtLength(i);
            break;
        }
    }
    return seg;
}

export function insertAt(arr: any[], position: number, item: any) {
    const newArray = [...arr.slice(0, position), item, ...arr.slice(position)];
    return newArray;
}

export function bringToTopofSVG(targetElement: SVGElement) {
    let parent = targetElement.ownerSVGElement;
    if (parent) {
        parent.appendChild(targetElement);
    }
}


/**
 * Finds the nearest point on a line segment to a given point.
 *
 * @param px - The x-coordinate of the point.
 * @param py - The y-coordinate of the point.
 * @param ax - The x-coordinate of the start of the line segment.
 * @param ay - The y-coordinate of the start of the line segment.
 * @param bx - The x-coordinate of the end of the line segment.
 * @param by - The y-coordinate of the end of the line segment.
 * @returns An object containing the x and y coordinates of the nearest point on the line segment.
 */
export function findNearestPointOnLine(px: number, py: number, ax: number, ay: number, bx: number, by: number)
{
    const atob = { x: bx - ax, y: by - ay };
    const atop = { x: px - ax, y: py - ay };
    const len = (atob.x * atob.x) + (atob.y * atob.y);
    let dot = (atop.x * atob.x) + (atop.y * atob.y);
    const t = Math.min(1, Math.max(0, dot / len));

    dot = ((bx - ax) * (py - ay)) - ((by - ay) * (px - ax));

    return { x: ax + (atob.x * t), y: ay + (atob.y * t) };
}