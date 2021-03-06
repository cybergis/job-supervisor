"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var execSync = require('child_process').execSync;
var Helper = {
    btoa: function (target) {
        return Buffer.from(target, 'base64').toString('binary');
    },
    atob: function (target) {
        return Buffer.from(target).toString('base64');
    },
    hideCredFromManifest: function (manifest) {
        var out = {};
        for (var i in manifest) {
            if (i != 'cred') {
                out[i] = manifest[i];
            }
        }
        return out;
    },
    randomStr: function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    setupFirewallRules: function (rules, sys) {
        if (sys == 'linux') {
            for (var i in rules) {
                var rule = rules[i];
                var t = '';
                var r = '';
                if (Array.isArray(rule)) {
                    t = rule[0] + ' ';
                    r = rule[1];
                }
                else {
                    r = rule;
                }
                try {
                    execSync('iptables ' + t + '-D ' + r, {
                        stdio: 'ignore'
                    });
                }
                catch (e) {
                }
                try {
                    execSync('iptables ' + t + '-A ' + r, {
                        stdio: 'ignore'
                    });
                }
                catch (err) {
                    console.error('error occurred when adding rule ' + 'iptables ' + t + '-A ' + r);
                    console.error(err.toString());
                }
            }
        }
    },
    teardownFirewallRules: function (rules, sys) {
        if (sys == 'linux') {
            for (var i in rules) {
                var rule = rules[i];
                var t = '';
                var r = '';
                if (Array.isArray(rule)) {
                    t = rule[0] + ' ';
                    r = rule[1];
                }
                else {
                    r = rule;
                }
                try {
                    execSync('iptables ' + t + '-D ' + r, {
                        stdio: 'ignore'
                    });
                }
                catch (e) {
                }
            }
        }
    },
    onExit: function (callback) {
        process.on('exit', function () {
            callback();
            setTimeout(function () {
                process.exit(1);
            }, 3 * 1000);
        });
        process.on('SIGINT', function () {
            callback();
            setTimeout(function () {
                process.exit(1);
            }, 3 * 1000);
        });
        process.on('SIGUSR1', function () {
            callback();
            setTimeout(function () {
                process.exit(1);
            }, 3 * 1000);
        });
        process.on('SIGUSR2', function () {
            callback();
            setTimeout(function () {
                process.exit(1);
            }, 3 * 1000);
        });
        process.on('SIGTERM', function () {
            callback();
            setTimeout(function () {
                process.exit(1);
            }, 3 * 1000);
        });
        process.on('uncaughtException', function () {
            callback();
            setTimeout(function () {
                process.exit(1);
            }, 3 * 1000);
        });
    },
    consoleEnd: '\x1b[0m',
    consoleGreen: '\x1b[32m'
};
exports.default = Helper;
