class Scene extends Physijs.Scene {
    constructor(renderElement, main) {
        Physijs.scripts.worker = './js/physijs/physijs_worker.js';
        Physijs.scripts.ammo = './ammo.js';
        super();
        let scene = this;
        this.main = main;

        this.renderElement = renderElement;
        this.camera = new THREE.PerspectiveCamera(45, this.renderElement.offsetWidth / this.renderElement.offsetHeight, 0.1, 10000);

        this.renderer = new THREE.WebGLRenderer({
            alpha: false,
            antialias: true
        });

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        this.renderer.setSize(this.renderElement.offsetWidth, this.renderElement.offsetHeight);
        this.renderElement.appendChild(this.renderer.domElement);
        window.addEventListener('resize', () => this.onWindowResize());

        this.controls = new THREE.OrbitControls(this.camera, renderElement);

        let floorZ = 366,
            floorX = 150,
            geometry = new THREE.CubeGeometry(1, 2, 1),
            material = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0x00ff00 }), 1, 0.2),
            floorGeometry = new THREE.CubeGeometry(floorX, 1, floorZ),
            textureLoader = new THREE.TextureLoader(),
            floorMap = textureLoader.load('img/textures/4way.png'),
            floorHeight = textureLoader.load('img/textures/4way.heightmap.png'),
            floorMaterial = new THREE.MeshPhongMaterial({
                shininess: 20,
                bumpMap: floorMap,
                map: floorMap,
                bumpScale: 0.45,
            });
        this.floor = new Physijs.BoxMesh(floorGeometry, floorMaterial);
        floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;

        floorMap.repeat.set(floorX / 50, floorZ / 50);
        this.floor.receiveShadow = true;
        this.add(this.floor);
        this.floor.mass = 0;

        this.lights = {
            ambient: new AmbientLight(this),
            directional: new DirectionalLight(this, 20, 11, 5)
        }

        this.skyBox = new SkyBox(this, 'img/skybox/clouds/');

        this.stats = new Stats();
        this.stats.showPanel(1);
        document.body.appendChild(this.stats.dom);

        main.loop.add(() => this.simulate());
        this.car = new PlayerCar(this, 0, 3, 0);

        this.camera.position.x = 0;
        this.camera.position.y = 3;
        this.camera.position.z = -6;

        this.camera.lookAt(new THREE.Vector3(0, 2, 0));

        this.render();
    }
    render() {
        this.stats.begin();
        this.renderer.render(this, this.camera);
        this.stats.end();
        requestAnimationFrame(() => this.render());
    }
    onWindowResize() {
        this.camera.aspect = this.renderElement.offsetWidth / this.renderElement.offsetHeight;
        this.renderer.setSize(this.renderElement.offsetWidth, this.renderElement.offsetHeight);
        this.camera.updateProjectionMatrix();
    }
}