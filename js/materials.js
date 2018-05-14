function planetMaterial(type) {
    switch (type) {
        case "grass":
            return grassPBR();
            break;
        case "planet":
            return planetPBR();
            break;
        case "sand":
            return sandPBR();
            break;
        default:
            var fText = gui.fText;
            if (fText.params != undefined) {
                fText.removeFolder('Material Properties');
            }
            return new THREE.MeshPhongMaterial();
    }
}

function grassPBR() {
    var repeat = 4;
    var name = "grass";
    var suffix = "jpg";
    var ao = new THREE.TextureLoader().load("PBR/" + name + "/AO." + suffix);
    ao.wrapS = THREE.RepeatWrapping;
    ao.wrapT = THREE.RepeatWrapping;
    ao.repeat.set(repeat, repeat);
    var bump = new THREE.TextureLoader().load("PBR/" + name + "/Bump." + suffix);
    bump.wrapS = THREE.RepeatWrapping;
    bump.wrapT = THREE.RepeatWrapping;
    bump.repeat.set(repeat, repeat);
    var disp = new THREE.TextureLoader().load("PBR/" + name + "/Displacement." + suffix);
    disp.wrapS = THREE.RepeatWrapping;
    disp.wrapT = THREE.RepeatWrapping;
    disp.repeat.set(repeat, repeat);
    var rough = new THREE.TextureLoader().load( "PBR/" + name + "/Roughness." + suffix);
    rough.wrapS = THREE.RepeatWrapping;
    rough.wrapT = THREE.RepeatWrapping;
    rough.repeat.set(repeat, repeat);
    var color = new THREE.TextureLoader().load( "PBR/" + name + "/Albedo." + suffix);
    color.wrapS = THREE.RepeatWrapping;
    color.wrapT = THREE.RepeatWrapping;
    color.repeat.set(repeat, repeat);

    var material = new THREE.MeshStandardMaterial({aoMap: ao, aoMapIntensity: 1.0, bumpMap: bump,
                                            bumpScale: 1.7, displacementMap: disp,
                                            roughness: 1, roughnessMap: rough, map: color, displacementScale: 10,
                                            metalness: 0.0});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 10).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 2).name('Metalness');
    matParams.add(material, 'bumpScale', 0.0, 5).name("Bump Map");

    return material;
}

function planetPBR() {
    var repeat = 2;
    var name = "planet";
    var suffix = "png";
    var ao = new THREE.TextureLoader().load("PBR/" + name + "/AO." + suffix);
    ao.wrapS = THREE.RepeatWrapping;
    ao.wrapT = THREE.RepeatWrapping;
    ao.repeat.set(repeat, repeat);
    var disp = new THREE.TextureLoader().load("PBR/" + name + "/Displacement." + suffix);
    disp.wrapS = THREE.RepeatWrapping;
    disp.wrapT = THREE.RepeatWrapping;
    disp.repeat.set(repeat, repeat);
    var norm = new THREE.TextureLoader().load("PBR/" + name + "/Normal." + suffix);
    norm.wrapS = THREE.RepeatWrapping;
    norm.wrapT = THREE.RepeatWrapping;
    norm.repeat.set(repeat, repeat);
    var rough = new THREE.TextureLoader().load( "PBR/" + name + "/Roughness." + suffix);
    rough.wrapS = THREE.RepeatWrapping;
    rough.wrapT = THREE.RepeatWrapping;
    rough.repeat.set(repeat, repeat);
    var color = new THREE.TextureLoader().load( "PBR/" + name + "/Albedo." + suffix);
    color.wrapS = THREE.RepeatWrapping;
    color.wrapT = THREE.RepeatWrapping;
    color.repeat.set(repeat, repeat);

    var material = new THREE.MeshStandardMaterial({aoMap: ao, aoMapIntensity: 2.5,
                                            displacementMap: disp, displacementScale: 3,
                                            roughnessMap: rough, roughness: 1,
                                            normalMap: norm, normalScale: new THREE.Vector2(3, 3),
                                            metalness: 0.45,
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 10).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', 0.0, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    return material;
}

function sandPBR() {
    var repeat = 4;
    var name = "sand";
    var suffix = "png";
    var ao = new THREE.TextureLoader().load("PBR/" + name + "/AO." + suffix);
    ao.wrapS = THREE.RepeatWrapping;
    ao.wrapT = THREE.RepeatWrapping;
    ao.repeat.set(repeat, repeat);
    var disp = new THREE.TextureLoader().load("PBR/" + name + "/Displacement." + suffix);
    disp.wrapS = THREE.RepeatWrapping;
    disp.wrapT = THREE.RepeatWrapping;
    disp.repeat.set(repeat, repeat);
    var norm = new THREE.TextureLoader().load("PBR/" + name + "/Normal." + suffix);
    norm.wrapS = THREE.RepeatWrapping;
    norm.wrapT = THREE.RepeatWrapping;
    norm.repeat.set(repeat, repeat);
    var rough = new THREE.TextureLoader().load("PBR/" + name + "/Roughness." + suffix);
    rough.wrapS = THREE.RepeatWrapping;
    rough.wrapT = THREE.RepeatWrapping;
    rough.repeat.set(repeat, repeat);
    var metal = new THREE.TextureLoader().load("PBR/" + name + "/Metalness." + suffix);
    metal.wrapS = THREE.RepeatWrapping;
    metal.wrapT = THREE.RepeatWrapping;
    metal.repeat.set(repeat, repeat);
    var color = new THREE.TextureLoader().load("PBR/" + name + "/Albedo." + suffix);
    color.wrapS = THREE.RepeatWrapping;
    color.wrapT = THREE.RepeatWrapping;
    color.repeat.set(repeat, repeat);

    var material = new THREE.MeshStandardMaterial({aoMap: ao, aoMapIntensity: 10.0,
                                            displacementMap: disp, displacementScale: 2,
                                            roughnessMap: rough, roughness: 1,
                                            metalnessMap: metal, metalness: 1.0,
                                            normalMap: norm, normalScale: new THREE.Vector2(1, 1),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 10).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 5).name('Metalness');
    matParams.add(material.normalScale, 'x', 0.0, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    return material;
}

function sandStonePBR() {
    var repeat = 4;
    var name = "sandstone";
    var suffix = "png";
    var ao = new THREE.TextureLoader().load("PBR/" + name + "/AO." + suffix);
    ao.wrapS = THREE.RepeatWrapping;
    ao.wrapT = THREE.RepeatWrapping;
    ao.repeat.set(repeat, repeat);
    var disp = new THREE.TextureLoader().load("PBR/" + name + "/Displacement." + suffix);
    disp.wrapS = THREE.RepeatWrapping;
    disp.wrapT = THREE.RepeatWrapping;
    disp.repeat.set(repeat, repeat);
    var norm = new THREE.TextureLoader().load("PBR/" + name + "/Normal." + suffix);
    norm.wrapS = THREE.RepeatWrapping;
    norm.wrapT = THREE.RepeatWrapping;
    norm.repeat.set(repeat, repeat);
    var rough = new THREE.TextureLoader().load("PBR/" + name + "/Roughness." + suffix);
    rough.wrapS = THREE.RepeatWrapping;
    rough.wrapT = THREE.RepeatWrapping;
    rough.repeat.set(repeat, repeat);
    var metal = new THREE.TextureLoader().load("PBR/" + name + "/Metalness." + suffix);
    metal.wrapS = THREE.RepeatWrapping;
    metal.wrapT = THREE.RepeatWrapping;
    metal.repeat.set(repeat, repeat);
    var color = new THREE.TextureLoader().load("PBR/" + name + "/Albedo." + suffix);
    color.wrapS = THREE.RepeatWrapping;
    color.wrapT = THREE.RepeatWrapping;
    color.repeat.set(repeat, repeat);

    var material = new THREE.MeshStandardMaterial({aoMap: ao, aoMapIntensity: 10.0,
                                            displacementMap: disp, displacementScale: 2,
                                            roughnessMap: rough, roughness: 1,
                                            metalnessMap: metal, metalness: 1.0,
                                            normalMap: norm, normalScale: new THREE.Vector2(1, 1),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 10).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 5).name('Metalness');
    matParams.add(material.normalScale, 'x', 0.0, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    return material;
}
