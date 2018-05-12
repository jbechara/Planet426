var paramController;

function init_gui() {
    gui = new dat.GUI();
    gui.add(params, 'radius', 10, 1000).step(10).name('Radius').onChange(refreshGeometry);
    gui.add(params, 'detail', 0, 7).step(1).name('Level of Detail').onChange(refreshGeometry);
}
