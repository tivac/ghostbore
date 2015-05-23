"use strict";

var path      = require("path"),
    spawn     = require("child_process").spawn,
    webdriver = require("webdriverio");

// Handle starting the selenium server
function selenium(done) {
    var child = spawn("java", [
          "-jar", path.join(__dirname, "./bin/selenium-server-standalone-2.45.0.jar")
        ]);

    function failure() {
        done(new Error("Unable to start selenium"));
    }

    function check(data) {
        var success = "Started org.openqa.jetty.jetty.Server"

        if(data.toString().indexOf(success) === -1) {
            return;
        }
        
        // Remove event listeners, we've started
        child.stderr.removeListener("data", check);
        child.removeListener("exit", failure)
            
        done(null, child)
    }

    child.on("exit", failure)
    child.stderr.on("data", check);
}

// Set up global before/after to start selenium server & configure webdriverio
before(function(done) {
    var self = this;

    selenium(function(error, server) {
        global.server = server;
        
        var browser;

        browser = global.browser = webdriver.remote({
            desiredCapabilities : {
                browserName : "phantomjs"
            }
        });
        
        browser.init(done);
    });
});

after(function(done) {
    browser.end(function() {
        server.kill();

        done();
    });
});
