/**
* @license highway https://github.com/cosmios/highway
*
* The MIT License (MIT)
*
* Copyright (c) 2014 Olivier Scherrer <pode.fr@gmail.com>
*/
var Highway = require("../index"),
    Observable = require("watch-notify");

describe("Highway", function () {

    it("is a constructor function", function () {
        expect(typeof Highway).toBe("function");
    });

    it("has functions to get the internal observables", function () {
        var highway = new Highway();

        expect(highway.getRoutesObservable() instanceof Observable).toBe(true);
        expect(highway.getEventsObservable() instanceof Observable).toBe(true);
    });

});

describe("Highway manages routes", function () {

    var highway = null,
        routesObservable = null;

    beforeEach(function () {
        highway = new Highway();
        routesObservable = highway.getRoutesObservable();
    });

    it("can set a new route", function () {
        var func = function () {},
            scope = {},
            handle;

        expect(typeof highway.set).toBe("function");
        spyOn(routesObservable, "watch").andCallThrough();

        handle = highway.set("test", func, scope);

        expect(routesObservable.watch.wasCalled).toBe(true);
        expect(routesObservable.watch.mostRecentCall.args[0]).toBe("test");
        expect(routesObservable.watch.mostRecentCall.args[1]).toBe(func);
        expect(routesObservable.watch.mostRecentCall.args[2]).toBe(scope);

        expect(routesObservable.hasObserver(handle)).toBe(true);
    });

    it("can remove routes", function () {
        var func = function () {},
        scope = {},
        handle;

        spyOn(routesObservable, "unwatch").andCallThrough();
        expect(typeof highway.unset).toBe("function");

        handle = highway.set("test", func, scope);

        expect(highway.unset(handle)).toBe(true);

        expect(routesObservable.unwatch.wasCalled).toBe(true);
        expect(routesObservable.unwatch.mostRecentCall.args[0]).toBe(handle);
    });

});

describe("Highway navigates to routes", function () {

    var highway = null,
    routesObservable = null;

    beforeEach(function () {
        highway = new Highway();
        routesObservable = highway.getRoutesObservable();
    });

    it("can load a route", function () {
        var params = {};
        expect(typeof highway.load).toBe("function");

        highway.set("test", function () {});
        spyOn(routesObservable, "notify").andCallThrough();
        expect(highway.load("test", params)).toBe(true);

        expect(routesObservable.notify.wasCalled).toBe(true);
        expect(routesObservable.notify.mostRecentCall.args[0]).toBe("test");
        expect(routesObservable.notify.mostRecentCall.args[1]).toBe(params);
    });

    it("navigates to a defined route", function () {
        var params = {};

        highway.set("test", function () {});
        spyOn(highway, "load").andCallThrough();
        expect(highway.navigate("test", params)).toBe(true);

        expect(highway.load.wasCalled).toBe(true);
        expect(highway.load.mostRecentCall.args[0]).toBe("test");
        expect(highway.load.mostRecentCall.args[1]).toBe(params);
    });

    it("navigates to a defined route with n arguments", function () {
        var spy = jasmine.createSpy();
        highway.set("test", spy);

        highway.navigate("test", "arg1", "arg2", "arg3");

        expect(spy).toHaveBeenCalledWith("arg1", "arg2", "arg3");
    });

    it("returns false if no route", function () {
        expect(highway.navigate("route")).toBe(false);
    });

});

describe("Highway notifies the activity", function () {

    var highway = null,
    eventsObservable = null;

    beforeEach(function () {
        highway = new Highway();
        eventsObservable = highway.getEventsObservable();
    });

    it("provides way to watch for route change", function () {
        var handle,
            scope = {},
            func = function () {};

        expect(typeof highway.watch).toBe("function");
        spyOn(eventsObservable, "watch").andCallThrough();

        handle = highway.watch(func, scope);

        expect(eventsObservable.watch.wasCalled).toBe(true);
        expect(eventsObservable.watch.mostRecentCall.args[0]).toBe("route");
        expect(eventsObservable.watch.mostRecentCall.args[1]).toBe(func);
        expect(eventsObservable.watch.mostRecentCall.args[2]).toBe(scope);

        expect(eventsObservable.hasObserver(handle)).toBe(true);
    });

    it("provides a function to unwatch route change", function () {
        var handle;

        handle = highway.watch(function () {}, {});

        spyOn(eventsObservable, "unwatch").andCallThrough();
        expect(typeof highway.unwatch).toBe("function");
        expect(highway.unwatch(handle)).toBe(true);

        expect(eventsObservable.unwatch.wasCalled).toBe(true);
        expect(eventsObservable.unwatch.mostRecentCall.args[0]).toBe(handle);
    });

    it("notifies on route change", function () {
        var params = {};

        spyOn(eventsObservable, "notify");

        highway.set("new route", function () {}, {});
        highway.navigate("new route", params);

        expect(eventsObservable.notify.wasCalled).toBe(true);
        expect(eventsObservable.notify.mostRecentCall.args[0]).toBe("route");
        expect(eventsObservable.notify.mostRecentCall.args[1]).toBe("new route");
        expect(eventsObservable.notify.mostRecentCall.args[2]).toBe(params);
    });

    it("doesn't notify if route doesn't exist", function () {
        var params = {};

        spyOn(eventsObservable, "notify");

        highway.navigate("route", params);

        expect(eventsObservable.notify.wasCalled).toBe(false);
    });
});

describe("Highway can keep track of the history", function () {

    var highway = null,
        historyStore = null;

    beforeEach(function () {
        highway = new Highway();
        historyStore = highway.getHistoryStore();
    });

    it("has a function to retrieve history store", function () {
        expect(typeof highway.getHistoryStore).toBe("function");
        expect(Array.isArray(highway.getHistoryStore())).toBe(true);
        expect(highway.getHistoryStore().length).toBe(0);
    });

    it("sets history while changing route", function () {
        var obj0 = {},
            obj1 = {},
            obj2 = {};

        spyOn(historyStore, "push").andCallThrough();

        highway.set("route", function () {});

        highway.navigate("route", obj0);
        highway.navigate("route", obj1);
        highway.navigate("route", obj2);

        expect(historyStore.push.wasCalled).toBe(true);
        expect(historyStore.push.mostRecentCall.args[0][0]).toBe("route");
        expect(historyStore.push.mostRecentCall.args[0][1]).toBe(obj2);
    });

    it("clears the forward history when navigating to a new route", function () {
        highway.set("route1", function () {});
        highway.set("route2", function () {});
        highway.set("route3", function () {});
        spyOn(historyStore, "splice").andCallThrough();
        highway.navigate("route1");
        highway.navigate("route2");
        historyStore.splice.reset();
        highway.navigate("route3");
        expect(historyStore.splice.calls[0].args[0]).toBe(2);
        expect(historyStore.splice.calls[0].args[1]).toBe(2);
    });

    it("can navigate through the history", function () {
        var obj0 = {o:0},
        obj1 = {o:1},
        obj2 = {o:2};

        expect(typeof highway.go).toBe("function");

        highway.set("route", function () {});

        highway.navigate("route", obj0);
        highway.navigate("route", obj1);
        highway.navigate("route", obj2);

        spyOn(highway, "load").andCallThrough();

        expect(highway.go(-2)).toBe(true);

        expect(highway.load.wasCalled).toBe(true);
        expect(highway.load.mostRecentCall.args[0]).toBe("route");
        expect(highway.load.mostRecentCall.args[1]).toBe(obj0);

        expect(highway.go(-2)).toBe(false);

        expect(highway.go(1)).toBe(true);
        expect(highway.load.mostRecentCall.args[0]).toBe("route");
        expect(highway.load.mostRecentCall.args[1]).toBe(obj1);

        expect(highway.go(2)).toBe(false);
    });

    it("has a back function for go(-1)", function () {
        expect(typeof highway.back).toBe("function");

        spyOn(highway, "go").andReturn(true);
        expect(highway.back()).toBe(true);
        expect(highway.go.wasCalled).toBe(true);
        expect(highway.go.mostRecentCall.args[0]).toBe(-1);
    });

    it("has a forward function for go(1)", function() {
        expect(typeof highway.forward).toBe("function");

        spyOn(highway, "go").andReturn(true);
        expect(highway.forward()).toBe(true);
        expect(highway.go.wasCalled).toBe(true);
        expect(highway.go.mostRecentCall.args[0]).toBe(1);
    });

    it("can limit the history to max history", function () {
        expect(highway.getMaxHistory()).toBe(10);
        expect(highway.setMaxHistory(-1)).toBe(false);
        expect(highway.setMaxHistory(0)).toBe(true);
        expect(highway.getMaxHistory()).toBe(0);
    });

    it("ensures that the history doesn't grow bigger than max history while navigating", function () {
        highway.set("route", function () {});
        spyOn(highway, "ensureMaxHistory");
        highway.navigate("route");
        expect(highway.ensureMaxHistory.wasCalled).toBe(true);
        expect(highway.ensureMaxHistory.mostRecentCall.args[0]).toBe(historyStore);
    });

    it("reduces the depth of the history", function () {
        historyStore.length = 10;
        spyOn(highway, "getMaxHistory").andReturn(10);
        spyOn(historyStore, "splice").andCallThrough();

        highway.ensureMaxHistory(historyStore);

        expect(historyStore.splice.wasCalled).toBe(false);

        highway.getMaxHistory.andReturn(3);

        highway.ensureMaxHistory(historyStore);

        expect(historyStore.splice.wasCalled).toBe(true);
        expect(historyStore.splice.mostRecentCall.args[0]).toBe(0);
        expect(historyStore.splice.mostRecentCall.args[1]).toBe(7);
    });

    it("can clear the history", function () {
        highway.clearHistory();
        expect(historyStore.length).toBe(0);
    });

});
