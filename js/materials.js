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
        case "sandstone":
            return sandstonePBR();
            break;
        case "carvedlimestone":
            return carvedlimestonePBR();
            break;
        case "wornstone":
            return wornstonePBR();
            break;
        case "soil":
            return soilPBR();
            break;
        case "pockedstone":
            return pockedstonePBR();
            break;
        case "crateredrock":
            return crateredrockPBR();
            break;
        case "redstone":
            return redstonePBR();
            break;
        case "granite":
            return granitePBR();
            break;
        case "redsand":
            return redsandPBR();
            break;
        case "dirt":
            return dirtPBR();
            break;
        case "lunar":
            return lunarPBR();
            break;
        case "streakedstone":
            return streakedstonePBR();
            break;
        case "redrock":
            return redrockPBR();
            break;
        case "blackrock":
            return blackrockPBR();
            break;
        case "cave":
            return cavePBR();
            break;
        default:
            return customPBR();
            break;
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
    matParams.addColor(material, 'color').name('Color');

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
    matParams.add(material.normalScale, 'x', 0, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
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
                                            normalMap: norm, normalScale: new THREE.Vector2(-1, -1),
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
    matParams.add(material.normalScale, 'x', -5, 0).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}

function sandstonePBR() {
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
                                            displacementMap: disp, displacementScale: 10,
                                            roughnessMap: rough, roughness: 1,
                                            metalnessMap: metal, metalness: 0,
                                            normalMap: norm, normalScale: new THREE.Vector2(-0.5, -0.5),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 20).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', -5, 0).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}

function carvedlimestonePBR() {
    var repeat = 2;
    var name = "carvedlimestone";
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
                                            displacementMap: disp, displacementScale: 5,
                                            roughnessMap: rough, roughness: 1,
                                            metalnessMap: metal, metalness: 0,
                                            normalMap: norm, normalScale: new THREE.Vector2(-2, -2),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 20).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', -5, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}

function wornstonePBR() {
    var repeat = 4;
    var name = "wornstone";
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

    var material = new THREE.MeshStandardMaterial({aoMap: ao, aoMapIntensity: 2.0,
                                            displacementMap: disp, displacementScale: 3,
                                            roughnessMap: rough, roughness: .9,
                                            metalnessMap: metal, metalness: 0,
                                            normalMap: norm, normalScale: new THREE.Vector2(1.5, 1.5),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 5).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', -5, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}

function soilPBR() {
    var repeat = 4;
    var name = "soil";
    var suffix = "png";
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

    var material = new THREE.MeshStandardMaterial({aoMapIntensity: 0.5,
                                            displacementMap: disp, displacementScale: 1,
                                            roughnessMap: rough, roughness: 1,
                                            metalnessMap: metal, metalness: 1,
                                            normalMap: norm, normalScale: new THREE.Vector2(0.5, 0.5),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 5).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', 0, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}

function pockedstonePBR() {
    var repeat = 4;
    var name = "pockedstone";
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
                                            displacementMap: disp, displacementScale: 12,
                                            roughnessMap: rough, roughness: 1,
                                            metalnessMap: metal, metalness: 0,
                                            normalMap: norm, normalScale: new THREE.Vector2(-1, -1),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 20).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', -5, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}

function crateredrockPBR() {
    var repeat = 4;
    var name = "crateredrock";
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
                                            displacementMap: disp, displacementScale: 8,
                                            roughnessMap: rough, roughness: 1,
                                            metalnessMap: metal, metalness: 1,
                                            normalMap: norm, normalScale: new THREE.Vector2(1, 1),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 20).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', 0, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}

function redstonePBR() {
    var repeat = 4;
    var name = "redstone";
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

    var material = new THREE.MeshStandardMaterial({aoMap: ao, aoMapIntensity: 2.0,
                                            displacementMap: disp, displacementScale: 3,
                                            roughnessMap: rough, roughness: .9,
                                            metalnessMap: metal, metalness: 0,
                                            normalMap: norm, normalScale: new THREE.Vector2(-1.5, -1.5),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 5).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', -5, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}

function granitePBR() {
    var repeat = 4;
    var name = "granite";
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

    var material = new THREE.MeshStandardMaterial({aoMap: ao, aoMapIntensity: 2.0,
                                            displacementMap: disp, displacementScale: 2,
                                            roughnessMap: rough, roughness: .9,
                                            metalnessMap: metal, metalness: 0,
                                            normalMap: norm, normalScale: new THREE.Vector2(-1.5, -1.5),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 5).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', -5, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}

function redsandPBR() {
    var repeat = 4;
    var name = "redsand";
    var suffix = "png";
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

    var material = new THREE.MeshStandardMaterial({displacementMap: disp, displacementScale: 1,
                                            roughnessMap: rough, roughness: 1,
                                            metalnessMap: metal, metalness: 1,
                                            normalMap: norm, normalScale: new THREE.Vector2(1, 1),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', 0, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}

function dirtPBR() {
    var repeat = 4;
    var name = "dirt";
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

    var material = new THREE.MeshStandardMaterial({aoMap: ao, aoMapIntensity: 1,
                                            displacementMap: disp, displacementScale: 1,
                                            roughnessMap: rough, roughness: 1,
                                            metalnessMap: metal, metalness: 1,
                                            normalMap: norm, normalScale: new THREE.Vector2(-0.5, -0.5),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 5).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', -5, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}

function lunarPBR() {
    var repeat = 4;
    var name = "lunar";
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
    var color = new THREE.TextureLoader().load("PBR/" + name + "/Albedo." + suffix);
    color.wrapS = THREE.RepeatWrapping;
    color.wrapT = THREE.RepeatWrapping;
    color.repeat.set(repeat, repeat);

    var material = new THREE.MeshStandardMaterial({aoMap: ao, aoMapIntensity: 1.0,
                                            displacementMap: disp, displacementScale: 8,
                                            roughness: 1,
                                            metalness: 0.2,
                                            normalMap: norm, normalScale: new THREE.Vector2(2, 2),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 20).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', 0, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}


function streakedstonePBR() {
    var repeat = 4;
    var name = "streakedstone";
    var suffix = "png";
    var ao = new THREE.TextureLoader().load("PBR/" + name + "/AO." + suffix);
    ao.wrapS = THREE.RepeatWrapping;
    ao.wrapT = THREE.RepeatWrapping;
    ao.repeat.set(repeat, repeat);
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

    var material = new THREE.MeshStandardMaterial({aoMap: ao, aoMapIntensity: 1.0,
                                            roughnessMap: rough, roughness: 1,
                                            metalnessMap: metal, metalness: 1,
                                            normalMap: norm, normalScale: new THREE.Vector2(-1, -1),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'aoMapIntensity', 0, 20).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', -5, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}

function redrockPBR() {
    var repeat = 4;
    var name = "redrock";
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

    var material = new THREE.MeshStandardMaterial({aoMap: ao, aoMapIntensity: 8.0,
                                            displacementMap: disp, displacementScale: 10,
                                            roughnessMap: rough, roughness: 1,
                                            metalnessMap: metal, metalness: 1,
                                            normalMap: norm, normalScale: new THREE.Vector2(-1, -1),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 20).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', -5, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}


function blackrockPBR() {
    var repeat = 4;
    var name = "blackrock";
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
                                            displacementMap: disp, displacementScale: 4,
                                            roughnessMap: rough, roughness: 1,
                                            metalnessMap: metal, metalness: 1,
                                            normalMap: norm, normalScale: new THREE.Vector2(1, 1),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 20).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', -5, 5).name('Normal Scale').onChange(function(value)
                {material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}


function cavePBR() {
    var repeat = 4;
    var name = "cave";
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

    var material = new THREE.MeshStandardMaterial({aoMap: ao, aoMapIntensity: 1.0,
                                            displacementMap: disp, displacementScale: 5,
                                            roughnessMap: rough, roughness: .95,
                                            metalnessMap: metal, metalness: 1,
                                            normalMap: norm, normalScale: new THREE.Vector2(-1, -1),
                                            map: color});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'displacementScale', 0, 20).name('Height');
    matParams.add(material, 'aoMapIntensity', 0, 5).name('AO');
    matParams.add(material, 'roughness', 0.0, 1).name('Roughness');
    matParams.add(material, 'metalness', 0.0, 1).name('Metalness');
    matParams.add(material.normalScale, 'x', -5, 5).name('Normal Scale').onChange(function(value) {
                material.normalScale.y = value;});
    matParams.addColor(material, 'color').name('Color');
    return material;
}

function customPBR() {

    var material = new THREE.MeshPhongMaterial({flatShading: false, wireframe: false, reflectivity: 0,
                                            specular: 0x111111, vertexColors: THREE.VertexColors});
    var fText = gui.fText;
    if (fText.params != undefined) {
        fText.removeFolder('Material Properties');
    }
    var matParams = fText.addFolder('Material Properties');
    fText.params = matParams;
    matParams.add(material, 'reflectivity', 0.0, 1).name('Reflectivity');
    matParams.addColor(material, 'specular').name('Specular');
    matParams.add(material, 'flatShading', ['false', 'true']).name('Flat Shading').onChange(function(value) {
            if (value == 'true') planet.material.flatShading = true;
            else planet.material.flatShading = false;
            planet.material.needsUpdate = true;
        });
    matParams.add(material, 'wireframe', [false, true]).name('Wireframe').onChange(function(value) {
            if (value == 'true') planet.material.wireframe = true;
            else planet.material.wireframe = false;
            planet.material.needsUpdate = true;
        });
    return material;
}
