function init_gui() {
    gui = new dat.GUI();
    gui.add(params, 'radius', 10, 1000).step(10);
    gui.add(params, 'detail', 0, 10);
}
