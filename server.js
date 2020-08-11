"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Guard_1 = require("./src/Guard");
var Supervisor_1 = require("./src/Supervisor");
var Helper_1 = require("./src/Helper");
var constant_1 = require("./src/constant");
var bodyParser = require('body-parser');
var config = require('./config.json');
var Validator = require('jsonschema').Validator;
var express = require('express');
var requestIp = require('request-ip');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestIp.mw({ attributeName: 'ip' }));
var guard = new Guard_1.default();
var supervisor = new Supervisor_1.default();
var validator = new Validator();
if (!config.isTesting) {
    if (process.platform == "linux") {
        var iptablesRules = [];
        for (var k in config.clientIPs) {
            iptablesRules.push('INPUT -p tcp -s ' + config.clientIPs[k] + ' --dport ' + config.serverPort + ' -j ACCEPT');
        }
        iptablesRules.push('INPUT -p tcp -s localhost --dport ' + config.serverPort + ' -j ACCEPT');
        iptablesRules.push('INPUT -p tcp --dport ' + config.serverPort + ' -j DROP');
        Helper_1.default.setupFirewallRules(iptablesRules, 'linux');
    }
    Helper_1.default.onExit(function () {
        if (process.platform == "linux") {
            Helper_1.default.teardownFirewallRules(iptablesRules, 'linux');
        }
    });
}
var schemas = {
    manifest: {
        type: 'object',
        properties: {
            aT: {
                type: 'string'
            },
            dest: {
                type: 'string'
            },
            env: {
                type: 'object'
            },
            payload: {
                type: 'object'
            }
        },
        required: ['aT', 'dest']
    },
    credentials: {
        type: 'object',
        properties: {
            destination: {
                type: 'string'
            },
            user: {
                type: 'string'
            },
            password: {
                type: 'string'
            }
        },
        required: ['destination', 'user']
    },
    accessToken: {
        type: 'object',
        properties: {
            aT: {
                type: 'string'
            }
        },
        required: ['aT']
    }
};
function requestErrors(v) {
    if (v.valid) {
        return [];
    }
    var errors = [];
    for (var i in v.errors) {
        errors.push(v.errors[i].message);
    }
    return errors;
}
function setDefaultValues(data, defaults) {
    for (var k in defaults) {
        if (data[k] == undefined) {
            data[k] = defaults[k];
        }
    }
    return data;
}
app.get('/', function (req, res) {
    res.json({ message: 'hello world' });
});
app.post('/guard/secretToken', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var cred, errors, server, sT, sT, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cred = req.body;
                    errors = requestErrors(validator.validate(cred, schemas['credentials']));
                    if (errors.length > 0) {
                        res.json({
                            error: "invalid input",
                            messages: errors
                        });
                        res.status(402);
                        return [2];
                    }
                    server = constant_1.default.destinationMap[cred.destination];
                    if (server === undefined) {
                        res.json({
                            error: "unrecognized destination " + cred.destination,
                            message: ''
                        });
                        res.status(401);
                        return [2];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!server.isCommunityAccount) return [3, 3];
                    return [4, guard.issueSecretTokenForCommunityAccount(cred.destination, server.communityAccountSSH.user)];
                case 2:
                    sT = _a.sent();
                    return [3, 5];
                case 3: return [4, guard.issueSecretTokenForPrivateAccount(cred.destination, cred.user, cred.password)];
                case 4:
                    sT = _a.sent();
                    _a.label = 5;
                case 5: return [3, 7];
                case 6:
                    e_1 = _a.sent();
                    res.json({
                        error: "invalid credentials",
                        messages: [e_1.toString()]
                    });
                    res.status(401);
                    return [2];
                case 7:
                    res.json({
                        secretToken: sT
                    });
                    return [2];
            }
        });
    });
});
app.post('/supervisor', function (req, res) {
    var manifest = req.body;
    var errors = requestErrors(validator.validate(manifest, schemas['manifest']));
    if (errors.length > 0) {
        res.json({
            error: "invalid input",
            messages: errors
        });
        res.status(402);
        return;
    }
    manifest = setDefaultValues(manifest, {
        env: {},
        payload: {}
    });
    try {
        manifest = guard.validateAccessToken(manifest);
    }
    catch (e) {
        res.json({
            error: "invalid access token",
            messages: [e.toString()]
        });
        res.status(401);
        return;
    }
    manifest = supervisor.add(manifest);
    manifest = Helper_1.default.hideCredFromManifest(manifest);
    res.json(manifest);
});
app.get('/supervisor/:jobID', function (req, res) {
    var aT = req.body;
    var errors = requestErrors(validator.validate(aT, schemas['accessToken']));
    if (errors.length > 0) {
        res.json({
            error: "invalid input",
            messages: errors
        });
        res.status(402);
        return;
    }
    try {
        aT = guard.validateAccessToken(aT);
    }
    catch (e) {
        res.json({
            error: "invalid access token",
            messages: [e.toString()]
        });
        res.status(401);
        return;
    }
    res.json(supervisor.status(aT.uid, req.params.jobID));
});
app.get('/supervisor', function (req, res) {
    var aT = req.body;
    var errors = requestErrors(validator.validate(aT, schemas['accessToken']));
    if (errors.length > 0) {
        res.json({
            error: "invalid input",
            messages: errors
        });
        res.status(402);
        return;
    }
    try {
        aT = guard.validateAccessToken(aT);
    }
    catch (e) {
        res.json({
            error: "invalid access token",
            messages: [e.toString()]
        });
        res.status(401);
        return;
    }
    res.json(supervisor.status(aT.uid));
});
app.listen(config.serverPort, function () { return console.log('supervisor server is up, listening to port: ' + config.serverPort); });
