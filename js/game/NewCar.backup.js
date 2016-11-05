class NewCar {
    constructor(scene, x = 0, y = 0, z = 0, color = 'red') {
        let bodyGeometry = new THREE.BoxGeometry(2.5, 0.8, 4),
            roofGeometry = new THREE.BoxGeometry(2.4, 0.8, 2.7),
            bodyMaterial = new THREE.MeshStandardMaterial({ color: color }),
            roofMesh = new Physijs.BoxMesh(roofGeometry, new THREE.MeshStandardMaterial({ color: '#111111' })),
            bodyMesh = new Physijs.BoxMesh(bodyGeometry, bodyMaterial);
        bodyMesh.add(roofMesh);
        roofMesh.position.set(0, 0.8, -0.5);
        bodyMesh.position.set(x, y, z);

        this.vehicle = new Physijs.Vehicle(bodyMesh, new Physijs.VehicleTuning(
            10.88, //Suspension stiffness
            1.83, //Suspension compression
            0.28, //Suspension damping
            500, //Max suspension travel
            10.5, //Friction slip
            6000 //Max suspension force
        ));
        scene.add(this.vehicle);

        let wheels = {
            frontLeft: {
                position: new THREE.Vector3(1.2, 0, 1.4)
            },
            frontRight: {
                position: new THREE.Vector3(-1.2, 0, 1.4)
            },
            backLeft: {
                position: new THREE.Vector3(1.2, 0, -1.4)
            },
            backRight: {
                position: new THREE.Vector3(-1.2, 0, -1.4)
            }
        }

        this.maxSteerRotation = Math.PI / 4;

        let wheelMaterial = new THREE.MeshStandardMaterial({ color: 'rgb(40, 40, 40)' }),
            wheelRadius = 0.4,
            wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.6, 20);

        for (let position in wheels) {
            let pos = wheels[position].position;
            this.vehicle.addWheel(
                wheelGeometry,
                wheelMaterial,
                pos,
                new THREE.Vector3(0, -1, 0), // wheel direction
                new THREE.Vector3(-1, 0, 0), //wheel axle
                0.5, //suspension rest length
                wheelRadius, //wheel radius
                position.includes('front') //is front wheel
            );
        }

        this.groundDirection = new THREE.Vector3(0, -1, 0);
        this.maxSteerRotation = Math.PI / 4;

        this.gameLoop = scene.main.loop;
        this.gameLoop.add(() => this.update());

        this.boostPower = 50;
    }

    get isOnGround() {
        let carHeight = 3;
        return new THREE.Raycaster(this.position, this.groundDirection, 0, carHeight).intersectObjects([MAIN.scene.floor]).length > 0;
    }
    get directionalSpeed() {
        return this.getWorldDirection().multiply(this.getLinearVelocity());
    }

    get actor() {
        return this._actor;
    }

    set actor(value) {
        if (this._actor != undefined) this._actor.disable();
        this._actor = value;
        this._actor.init(this);
    }

    update() {
        if (this.actor == undefined) return;
        this.actor.driveCar(this);
    }

    accelerate(accelerationForce = 300) {
        console.log('applyEngineForce');
        this.vehicle.applyEngineForce(accelerationForce);
    }

    brake(power = 20) {
        this.vehicle.setBrake(power, 2);
        this.vehicle.setBrake(power, 3);
    }

    turn(direction = 1) {
        //1 = left
        //-1 = right
        this.wheelDirection += direction / 50;
    }

    get wheelDirection() {
        return this._wheelDirection || 0;
    }
    set wheelDirection(v) {
        v = v > this.maxSteerRotation ? this.maxSteerRotation : v;
        v = v < -this.maxSteerRotation ? -this.maxSteerRotation : v;
        this.vehicle.setSteering(v, 0);
        this.vehicle.setSteering(v, 1);
        //0: frontLeft
        //1: frontRight
        //2: backLeft
        //3: backRight

        this._wheelDirection = v;
    }

    boost() {
        if (!this.boostTimeout) {
            this.boostTimeout = true;

            this.setLinearVelocity(this.getWorldDirection().multiplyScalar(this.boostPower));

            setTimeout(() => delete this.boostTimeout, 10 * 1000); // 10 second boost delay
        }
    }

    jump() {
        if (this.isOnGround) {
            let currentVelocity = this.getLinearVelocity();
            this.setLinearVelocity(new THREE.Vector3(currentVelocity.x, currentVelocity.y + 10, currentVelocity.z));
            this.setAngularVelocity(new THREE.Vector3(4, 0, 0));
        }
    }
}
