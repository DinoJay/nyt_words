System.import('./client/Main').then(function(module){
    var App = module.default;
    React.render(<App/>, document.getElementById("app"));
});
