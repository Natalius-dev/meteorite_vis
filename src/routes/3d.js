import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function lat_long(lat, long, rho) {
    let latitude = (lat)*Math.PI/180;
    let longitude = ((-long)+180)*Math.PI/180;
    return new THREE.Vector3(rho*Math.cos(latitude)*Math.cos(longitude), rho*Math.sin(latitude), rho*Math.cos(latitude)*Math.sin(longitude));
}

function load() {
    const canvas = document.getElementById("3d");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, canvas.clientWidth / canvas.clientHeight, 0.01, 1500 );

    const renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas });
    renderer.setSize( renderer.domElement.clientWidth, renderer.domElement.clientHeight );
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.maxDistance = 30
    controls.minDistance = 10.5;
    controls.listenToKeyEvents(window);
    controls.keys = {
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp',
        RIGHT: 'ArrowRight',
        BOTTOM: 'ArrowDown'
    }

    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( canvas.clientWidth, canvas.clientHeight );
    });

    let daymap = new THREE.TextureLoader().load("/earth_daymap.jpg");
    daymap.colorSpace = THREE.SRGBColorSpace;
    daymap.magFilter = THREE.NearestFilter;
    let normalmap = new THREE.TextureLoader().load("/earth_normal_map.jpg");
    let specularmap = new THREE.TextureLoader().load("/2k_earth_specular_map.jpg");
    let metalmap = new THREE.TextureLoader().load("/earth_metal_map.jpg");
    let earth_geometry = new THREE.IcosahedronGeometry(10,15);
    let earth_material = new THREE.MeshStandardMaterial({
        map: daymap,
        normalMap: normalmap,
        roughnessMap: specularmap,
        roughness: 0.8,
        metalnessMap: metalmap,
        metalness: 0.4
    });
    let earth_mesh = new THREE.Mesh(earth_geometry, earth_material);
    scene.add(earth_mesh);

    let cloudsmap = new THREE.TextureLoader().load("/earth_clouds.jpg");
    cloudsmap.magFilter = THREE.NearestFilter;
    let clouds_geometry = new THREE.IcosahedronGeometry(10.01,15);
    let clouds_material = new THREE.MeshStandardMaterial({
        map: cloudsmap,
        transparent: true,
        alphaMap: cloudsmap
    });
    let clouds_mesh = new THREE.Mesh(clouds_geometry, clouds_material);
    earth_mesh.add(clouds_mesh);

    scene.add(new THREE.AmbientLight(0xffffff, 0.05));
    let sun = new THREE.PointLight(0xffffdd, 1);
    sun.position.setZ(400);
    scene.add(sun);

    let starsmap = new THREE.TextureLoader().load("/2k_stars_milky_way.jpg");
    starsmap.colorSpace = THREE.SRGBColorSpace;
    let stars_material = new THREE.MeshBasicMaterial({map: starsmap, side: THREE.BackSide});
    let stars_geometry = new THREE.SphereGeometry(1000, 64, 32);
    let stars_mesh = new THREE.Mesh(stars_geometry, stars_material);
    scene.add(stars_mesh);

    camera.position.setZ(15);
    camera.position.setY(5);

    // earth tilt
    earth_mesh.rotation.x = 0.4101524;

    let box = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({color:0x00ff00}));
    let lat = -6.200000;
    let lon = 106.816666;
    let pos = lat_long(lat, lon, 10);
    box.position.set(pos.x, pos.y, pos.z);
    earth_mesh.add(box);

    function animate() {
        controls.update();

        earth_mesh.rotateY(0.001);
        clouds_mesh.rotateY(0.00035);

        requestAnimationFrame( animate );
	    renderer.render( scene, camera );
    }
    animate();
}

export default load;