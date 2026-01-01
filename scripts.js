// canvas setup - begin
const canvas = document.getElementById("canvas")
const c =  canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const scoreDisplay = document.getElementById("score") 
let score = 0
// canvas setup - end

// class setup - begin
class Boundary {
    static width = 40
    static height = 40
constructor({position, image}){
    this.position = position
    this.width = 40
    this.height = 40
    this.image = image
}
    draw(){
        // c.fillStyle = "blue"
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

class Player {
constructor({position, velocity}){
    this.position = position
    this.velocity = velocity
    this.radius = 16
    this.radians = 0.75
    this.openRate = 0.12
    this.rotation = 0
}

draw(){
    c.save()
    c.translate(this.position.x,this.position.y)
    c.rotate(this.rotation)
    c.translate(-this.position.x,-this.position.y)
    c.beginPath()
    c.arc( this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
    c.lineTo(this.position.x, this.position.y)
    c.fillStyle = "yellow"
    c.fill()
    c.closePath()
    c.restore()
}

update(){
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if(this.radians < 0 || this.radians > 0.75){
        this.openRate = -this.openRate
    }
    this.radians += this.openRate
}
}

class Ghost {
    static speed = 2
constructor({position, velocity, color = "red"}){
    this.position = position
    this.velocity = velocity
    this.color = color
    this.radius = 16
    this.prevCollisions = []
    this.speed = 2
    this.scared = false
}

draw(){
    c.beginPath()
    c.arc( this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = this.scared ? "blue" : this.color
    c.fill()
    c.closePath()
}

update(){
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
}
}

class Pellet {
constructor({position}){
    this.position = position
    this.radius = 4
}

draw(){
    c.beginPath()
    c.arc( this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = "white"
    c.fill()
    c.closePath()
}
}

class PowerUp {
constructor({position}){
    this.position = position
    this.radius = 10
}

draw(){
    c.beginPath()
    c.arc( this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = "white"
    c.fill()
    c.closePath()
}
}
// class setup - end

// key begin
const keys = {
    w:{
        pressed: false
    },
    a:{
        pressed: false
    },
    s:{
        pressed: false
    },
    d:{
        pressed: false
    },
}
let lastKey = ""
// keys end
// map definition - begin
let map = [
    ["1", "-", "-", "-", "-", "-", "-", "-", "-", "2"],
    ["|", " ", ".", ".", ".", ".", ".", ".", ".", "|"],
    ["|", ".", "^", ".", "[", "]", ".", "^", ".", "|"],
    ["|", ".", "|", ".", ".", ".", ".", "v", ".", "|"],
    ["|", ".", "|", ".", "1", "2", ".", ".", ".", "|"],
    ["|", ".", "v", ".", "4", "3", ".", "^", ".", "|"],
    ["|", ".", ".", ".", ".", ".", ".", "|", ".", "|"],
    ["|", ".", "#", ".", "[", "]", ".", "v", ".", "|"],
    ["|", ".", ".", ".", ".", ".", ".", ".", ".", "|"],
    ["|", ".", "1", "-", "-", "-", "-", "2", ".", "|"],
    ["|", ".", "v", ".", ".", ".", ".", "v", ".", "|"],
    ["|", ".", ".", ".", "1", "2", ".", ".", "p", "|"],
    ["4", "-", "-", "-", "7","7", "-", "-", "-", "3" ]
]
// map definition - end

// boundaries array mit boundary Objects - begin
const player = new Player({
    position: {
    x: Boundary.width + Boundary.width/ 2,
    y: Boundary.height + Boundary.height/ 2,
    },
    velocity: {
    x: 0,
    y: 0
    }
})

const ghosts = [
    new Ghost({
        position:{
            x: Boundary.width * 8 + Boundary.width/ 2,
            y: Boundary.height + Boundary.height/ 2,
        },
        velocity: {
            x: -Ghost.speed,
            y: 0
        }
    }),
    new Ghost({
        position:{
            x: Boundary.width * 8 + Boundary.width/ 2,
            y: Boundary.height * 10 + Boundary.height/ 2,
        },
        velocity: {
            x: 0,
            y: -Ghost.speed
        },
        color: "orange"
    }),
    new Ghost({
        position:{
            x: Boundary.width + Boundary.width/ 2,
            y: Boundary.height * 10 + Boundary.height/ 2,
        },
        velocity: {
            x: 0,
            y: Ghost.speed
        },
        color: "pink"
    })
]

const boundaries = []
const pellets = []
const powerUps =[]


function createImage(src){
    const image = new Image()
    image.src = `./assets/${src}.png`
    return image
}

function addBoundary(column, row, src){
     boundaries.push(new Boundary({
        position: {
            x: Boundary.width * column,
            y: Boundary.height * row
            },
            image: createImage(src)
}))
}

for(let i = 0; i < map.length; i++){
    for(let j = 0; j < map[i].length; j++){
switch(map[i][j]){
    case "#":
    addBoundary(j,i, "block")
    break;
    case "-":
    addBoundary(j,i, "pipeVert")
    break;
   case "|":
    addBoundary(j,i, "pipeHorz")
    break;
    case "1":
    addBoundary(j,i, "topLeft")
    break;
    case "2":
    addBoundary(j,i, "topRight")
    break;
    case "3":
    addBoundary(j,i, "bottomRight")
    break;
    case "4":
    addBoundary(j,i, "bottomLeft")
    break;
    case "5":
    addBoundary(j,i, "forkTop")
    break;
    case "6":
    addBoundary(j,i, "forkRight")
    break;
    case "7":
    addBoundary(j,i, "forkBottom")
    break;
    case "8":
    addBoundary(j,i, "forkLeft")
    break;
    case "^":
    addBoundary(j,i, "capTop")
    break;
    case "v":
    addBoundary(j,i, "capBottom")
    break;
    case "[":
    addBoundary(j,i, "capLeft")
    break;
    case "]":
    addBoundary(j,i, "capRight")
    break;
    case "p":
   powerUps.push(
    new PowerUp({
        position: {
            x: j * Boundary.width + Boundary.width/ 2,
            y: i * Boundary.height + Boundary.height/ 2
            }
}))
    break;
    case ".":
   pellets.push(new Pellet({
        position: {
            x: j * Boundary.width + Boundary.width/ 2,
            y: i * Boundary.height + Boundary.height/ 2
            }
}))
    break;
    default:
}
    }
}
// boundaries array mit boundary Objects - end

// collisionPrediction function -end

// collision check function -begin
function circleCollidesRect({circle, rect}){
    const padding = Boundary.width/ 2 - circle.radius - 1
    if(    circle.position.y - circle.radius + circle.velocity.y
        <= rect.position.y + rect.height + padding      // top collision
        && circle.position.x + circle.radius + circle.velocity.x
        >= rect.position.x - padding                    // left collision
        && circle.position.y + circle.radius + circle.velocity.y
        >= rect.position.y - padding                    // bottom collision
        && circle.position.x - circle.radius + circle.velocity.x <=
        rect.position.x + rect.width + padding          // right collision
        ){
      return true
        }
    return false
}

function circleCollideCircle({circle1, circle2}){
if(Math.hypot(circle2.position.x - circle1.position.x, circle2.position.y - circle1.position.y)  < circle2.radius + circle1.radius  ){
        return true
        }
        return false
}

function collisionPrediction({cardDirection, speedX, speedY}){
    for(let i = 0; i < boundaries.length; i++){
    const boundary = boundaries[i]
    if(
            circleCollidesRect({
                circle: {...player, velocity: {
                    x: speedX,
                    y: speedY
                }},
                rect: boundary
            })
        ){
            player.velocity[cardDirection] = 0
            break
        }else{
            player.velocity[cardDirection] = cardDirection == "y" ? speedY : speedX
        }}
}

function updateVelocity(){
    if(keys.w.pressed && lastKey == "w"){
        collisionPrediction({cardDirection: "y", speedX: 0, speedY:-5})
    }else if(keys.a.pressed && lastKey == "a"){
        collisionPrediction({cardDirection: "x", speedX: -5, speedY:0})
    }else if(keys.s.pressed && lastKey == "s"){
        collisionPrediction({cardDirection: "y", speedX: 0, speedY: 5})
    }else if(keys.d.pressed && lastKey == "d"){
        collisionPrediction({cardDirection: "x", speedX: 5, speedY: 0})
    }
}
// collision check function -end

//animation loop -begin
let animationId

function animate(){
    c.clearRect(0,0, canvas.width, canvas.height)
    animationId = requestAnimationFrame(animate)

    updateVelocity()

    for(let i = pellets.length - 1; i >= 0; i--){
        const pellet = pellets[i]
        pellet.draw()
        
        if(circleCollideCircle({circle1: player, circle2: pellet})){
        pellets.splice(i,1)
        score += 10
        }
    }
   
    if(pellets.length === 0){
        console.log("You win!")
        cancelAnimationFrame(animationId)
    }

    ghosts.forEach((ghost, i) => {
         if(circleCollideCircle({circle1: player, circle2: ghost})){
            if(ghost.scared){
            ghosts.splice(i,1)
            }else{
            cancelAnimationFrame(animationId)
            }           
        }})

    powerUps.forEach((powerUp, i) => {
        powerUp.draw()
        if(circleCollideCircle({circle1: player, circle2: powerUp})){
        powerUps.splice(i,1)

        ghosts.forEach( ghost => {
            ghost.scared = true
            setTimeout(() =>
            ghost.scared = false, 5000)
        })
        }
    })

    boundaries.forEach(boundary => {
        boundary.draw()
        if(circleCollidesRect({circle: player, rect: boundary})
        ){
        player.velocity.x = 0
        player.velocity.y = 0
        }
    })


    scoreDisplay.innerHTML = score

    player.update()

//ghost collision logic -begin
    ghosts.forEach(ghost => {
        ghost.update()

        const collisions = []
        boundaries.forEach(boundary => {
            
            if( !collisions.includes("up") &&
            circleCollidesRect({
                circle: {...ghost,
                    velocity: {
                    x: 0,
                    y: -ghost.speed
                }},
                rect: boundary
            })
        ){ 
            collisions.push("up")
        }

            if( !collisions.includes("left") &&
            circleCollidesRect({
                circle: {...ghost,
                    velocity: {
                    x: -ghost.speed,
                    y: 0
                }},
                rect: boundary
            })
        ){ 
            collisions.push("left")
        }

            if( !collisions.includes("right") &&
            circleCollidesRect({
                circle: {...ghost,
                    velocity: {
                    x: ghost.speed,
                    y: 0
                }},
                rect: boundary
            })
        ){ 
            collisions.push("right")
        }

            if( !collisions.includes("down") &&
            circleCollidesRect({
                circle: {...ghost,
                    velocity: {
                    x: 0,
                    y: ghost.speed
                }},
                rect: boundary
            })
        ){ 
            collisions.push("down")
        }

        })

        if(collisions.length > ghost.prevCollisions.length){ 
              ghost.prevCollisions = collisions
        }
  
        if( JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)){
            if(ghost.velocity.x > 0){
                ghost.prevCollisions.push("right")
            }else if(ghost.velocity.x < 0){
                ghost.prevCollisions.push("left")
            }else if(ghost.velocity.y < 0){
                ghost.prevCollisions.push("up")
            }else if(ghost.velocity.y > 0){
                ghost.prevCollisions.push("down")
            }
            
            const pathways = ghost.prevCollisions.filter( collision =>
            {
                return !collisions.includes(collision)
            })
            
            const direction = pathways[Math.floor(Math.random() * pathways.length)]
            

            switch(direction){
                case "up":
                    ghost.velocity.y = -ghost.speed
                    ghost.velocity.x = 0
                break
                case "down":
                    ghost.velocity.y = ghost.speed
                    ghost.velocity.x = 0
                break
                case "left":
                    ghost.velocity.y = 0
                    ghost.velocity.x = -ghost.speed
                break
                case "right":
                    ghost.velocity.y = 0
                    ghost.velocity.x = ghost.speed
                break
            }
            ghost.prevCollisions = []
        }
    })
//ghost collision logic -end

//pacman mouth rotation logic -begin
    if(player.velocity.x > 0){
        player.rotation = 0
    }else if(player.velocity.x < 0){
        player.rotation = Math.PI
    }else if(player.velocity.y < 0){
        player.rotation = Math.PI * 1.5
    }else if(player.velocity.y > 0){
        player.rotation = Math.PI / 2
    }
}
//pacman mouth rotation logic -end

animate()
//animation loop -end

//eventListener defintions -begin
window.addEventListener("keydown", ({key}) => {
    switch(key){
        case "w":
            keys.w.pressed = true
            lastKey = "w"
            break
        case "a":
            keys.a.pressed = true
            lastKey = "a"
            break
        case "s":
            keys.s.pressed = true
            lastKey = "s"
            break
        case "d":
            keys.d.pressed = true
            lastKey = "d"
            break
    }
})

window.addEventListener("keyup", ({key}) => {
    switch(key){
        case "w":
            keys.w.pressed = false
            break
        case "a":
            keys.a.pressed = false
            break
        case "s":
            keys.s.pressed = false
            break
        case "d":
            keys.d.pressed = false
            break
    }
})
//eventListener defintions -end