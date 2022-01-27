/**
 * @tutorial https://towardsdatascience.com/implementing-2d-physics-in-javascript-860a7b152785
 */

function moveWithGravity(dt, o, lockAxis = 0) {
    // "o" refers to Array of objects we are moving
    for (let o1 of o) {
        // Zero-out accumulator of forces for each object
        o1.fx = 0;
        o1.fy = 0;
    }
    for (let [i, o1] of o.entries()) {
        // For each pair of objects...
        for (let [j, o2] of o.entries()) {
            if (i < j) {
                // To not do same pair twice
                let dx = o2.x - o1.x; // Compute distance between centers of objects
                let dy = o2.y - o1.y;
                let r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                if (r < 1) {
                    // To avoid division by 0
                    r = 1;
                }
                // Compute force for this pair; k = 1000
                let f = (1000 * o1.m * o2.m) / Math.pow(r, 2);
                let fx = (f * dx) / r; // Break it down into components
                let fy = (f * dy) / r;
                o1.fx += fx; // Accumulate for first object
                o1.fy += fy;
                o2.fx -= fx; // And for second object in opposite direction
                o2.fy -= fy;
            }
        }
    }
    for (let o1 of o) {
        // for each object update...
        let ax = o1.fx / o1.m; // ...acceleration
        let ay = o1.fy / o1.m;

        if (lockAxis === 0 || lockAxis === 1) {
            o1.vx += ax * dt; // ...x speed
            o1.x += o1.vx * dt; // ...x position
        }

        if (lockAxis === 0 || lockAxis === 2) {
            o1.vy += ay * dt; // ...y speed
            o1.y += o1.vy * dt; // ...y position
        }
    }
}

class Collision {
    constructor(o1, o2, dx, dy, d) {
        this.o1 = o1;
        this.o2 = o2;

        this.dx = dx;
        this.dy = dy;
        this.d = d;
    }
}

function checkCollision(o1, o2) {
    let dx = o2.x - o1.x;
    let dy = o2.y - o1.y;
    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (d < o1.r + o2.r) {
        return {
            collisionInfo: new Collision(o1, o2, dx, dy, d),
            collided: true,
        };
    }
    return {
        collisionInfo: null,
        collided: false,
    };
}

function resolveCollisionWithBounce(info) {
    let nx = info.dx / info.d;
    let ny = info.dy / info.d;
    let s = info.o1.r + info.o2.r - info.d;
    info.o1.x -= (nx * s) / 2;
    info.o1.y -= (ny * s) / 2;
    info.o2.x += (nx * s) / 2;
    info.o2.y += (ny * s) / 2;

    // Magic...
    let k =
        (-2 *
            ((info.o2.vx - info.o1.vx) * nx + (info.o2.vy - info.o1.vy) * ny)) /
        (1 / info.o1.m + 1 / info.o2.m);
    info.o1.vx -= (k * nx) / info.o1.m; // Same as before, just added "k" and switched to "m" instead of "s/2"
    info.o1.vy -= (k * ny) / info.o1.m;
    info.o2.vx += (k * nx) / info.o2.m;
    info.o2.vy += (k * ny) / info.o2.m;
}

function checkEdgeCollision(objects, canvas) {
    for (let obj of objects) {
        // Detect collision with right wall.
        if (obj.x + obj.r > canvas.width) {
            // Need to know how much we overshot the canvas width so we know how far to 'bounce'.
            obj.x = canvas.width - obj.r;
            obj.vx = -obj.vx;
            obj.ax = -obj.ax;
        }

        // Detect collision with bottom wall.
        else if (obj.y + obj.r > canvas.height) {
            obj.y = canvas.height - obj.r;
            obj.vy = -obj.vy;
            obj.ay = -obj.ay;
        }

        // Detect collision with left wall.
        else if (obj.x - obj.r < 0) {
            obj.x = obj.r;
            obj.vx = -obj.vx;
            obj.ax = -obj.ax;
        }
        // Detect collision with top wall.
        else if (obj.y - obj.r < 0) {
            obj.y = obj.r;
            obj.vy = -obj.vy;
            obj.ay = -obj.ay;
        }
    }
}

export {
    moveWithGravity,
    checkCollision,
    Collision,
    resolveCollisionWithBounce,
    checkEdgeCollision,
};
