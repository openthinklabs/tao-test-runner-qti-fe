/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

define([
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/navigation/next/linearNextItemWarning',
], function(runnerFactory, providerMock, pluginFactory) {
    'use strict';

    var pluginApi;
    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    /**
     * The following tests applies to all plugins
     */
    QUnit.module('pluginFactory');

    QUnit.test('module', function(assert) {
        assert.expect(3);
        const runner = runnerFactory(providerName);
        assert.equal(typeof pluginFactory, 'function', 'The pluginFactory module exposes a function');
        assert.equal(typeof pluginFactory(runner), 'object', 'The plugin factory produces an instance');
        assert.notStrictEqual(
            pluginFactory(runner),
            pluginFactory(runner),
            'The plugin factory provides a different instance on each call'
        );
    });

    pluginApi = [{
        name: 'init',
        title: 'init'
    }, {
        name: 'render',
        title: 'render'
    }, {
        name: 'finish',
        title: 'finish'
    }, {
        name: 'destroy',
        title: 'destroy'
    }, {
        name: 'trigger',
        title: 'trigger'
    }, {
        name: 'getTestRunner',
        title: 'getTestRunner'
    }, {
        name: 'getAreaBroker',
        title: 'getAreaBroker'
    }, {
        name: 'getConfig',
        title: 'getConfig'
    }, {
        name: 'setConfig',
        title: 'setConfig'
    }, {
        name: 'getState',
        title: 'getState'
    }, {
        name: 'setState',
        title: 'setState'
    }, {
        name: 'show',
        title: 'show'
    }, {
        name: 'hide',
        title: 'hide'
    }, {
        name: 'enable',
        title: 'enable'
    }, {
        name: 'disable',
        title: 'disable'
    }];

    QUnit.cases.init(pluginApi).test('plugin API ', function(data, assert) {
        assert.expect(1);
        const runner = runnerFactory(providerName);
        const timer = pluginFactory(runner);
        assert.equal(
            typeof timer[data.name],
            'function',
            `The pluginFactory instances expose a "${data.name}" function`
        );
    });

    /**
     * Specific tests for this plugin
     */
    QUnit.module('Behavior');

    const testMap = {
        identifier: "Test",
        parts: {
            'Part1': {
                id: 'Part1',
                position: 0,
                isLinear: true,
                sections: {
                    'Section1': {
                        id: 'Section1',
                        position: 0,
                        items: {
                            'FirstItem': {
                                id: 'FirstItem',
                                position: 0
                            },
                            'LastItem': {
                                id: 'LastItem',
                                position: 1
                            }
                        }
                    }
                }
            }
        },
        jumps: [{
            identifier: "FirstItem",
            section: "Section1",
            part: "Part1",
            position: 0
        }, {
            identifier: "LastItem",
            section: "Section1",
            part: "Part1",
            position: 1
        }]
    };

    // No dialog expected
    QUnit.cases.init([{
        title: 'when the next part warning is set',
        testContext: {
            enableAllowSkipping: false,
            allowSkipping: false,
            options: {
                nextPartWarning: true,
                nextSectionWarning: false
            },
            itemIdentifier: 'FirstItem',
            itemPosition: 0
        },
        item: {
            informational: false
        },
        isLinear : true,

    }, {
        title: 'when the next section warning is set',
        testContext: {
            options: {
                nextPartWarning: false,
                nextSectionWarning: true
            },
            itemIdentifier: 'FirstItem',
            itemPosition: 0
        },
        scope: 'section',
        item: {
            informational: false
        },
        isLinear : true
    }, {
        title: 'when the item is informational',
        testContext: {
            options: {
                nextPartWarning: false,
                nextSectionWarning: false
            },
            itemIdentifier: 'FirstItem',
            itemPosition: 0
        },
        item: {
            informational: true
        },
        isLinear : true
    }, {
        title: 'when the item is the last item',
        testContext: {
            options: {
                nextPartWarning: false,
                nextSectionWarning: false
            },
            itemIdentifier: 'LastItem',
            itemPosition: 1
        },
        item: {
            informational: false
        },
        isLinear : true
    }, {
        title: 'when the config setting is undefined',
        testContext: {
            options: {
                nextPartWarning: false,
                nextSectionWarning: false
            },
            itemIdentifier: 'FirstItem',
            itemPosition: 0
        },
        item: {
            informational: false
        },
        isLinear : true
    }, {
        title: 'when the config setting is explicitly false',
        testContext: {
            options: {
                nextPartWarning: false,
                nextSectionWarning: false
            },
            itemIdentifier: 'FirstItem',
            itemPosition: 0
        },
        testConfig: {
            forceEnableLinearNextItemWarning: false
        },
        item: {
            informational: false
        },
        isLinear : true
    }, {
        title: 'when the test is not linear',
        testContext: {
            options: {
                nextPartWarning: false,
                nextSectionWarning: false
            },
            itemIdentifier: 'FirstItem',
            itemPosition: 0
        },
        item: {
            informational: false
        },
        isLinear : false
    }]).test('No dialog is triggered ', function(caseData, assert) {
        const ready = assert.async();
        const runner = runnerFactory(providerName, {}, {
            options : caseData.testConfig
        });
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        // mock test store init
        runner.getTestStore = function() {
            return {
                setVolatile: function() {}
            };
        };
        runner.getCurrentItem = () => caseData.item;
        runner.getCurrentPart = () => Object.assign({
            isLinear : caseData.isLinear
        }, testMap.part);

        assert.expect(1);

        plugin
            .init()
            .then(function() {
                runner.setTestContext(caseData.testContext);
                runner.setTestMap(testMap);

                // dialog would be instantiated *before* move occurs
                runner.on('move', function() {
                    assert.ok(true, 'The move took place without interruption');
                    runner.destroy();
                    ready();
                    return Promise.reject();
                });
                runner.trigger('move', 'next', caseData.scope);
            })
            .catch(function(err) {
                assert.ok(false, err.message);
                ready();
            });
    });

    // Dialog expected
    QUnit.cases.init([{
        title: 'when a next warning is needed',
        event: 'next',
        testContext: {
            options: {
                nextPartWarning: false,
                nextSectionWarning: false
            },
            itemIdentifier: 'FirstItem',
            itemPosition: 0
        },
        testConfig: {
            forceEnableLinearNextItemWarning: true
        },
        item: {
            informational: false
        },
        isLinear : true
    }, {
        title: 'when a skip warning is needed',
        event: 'skip',
        testContext: {
            options: {
                nextPartWarning: false,
                nextSectionWarning: false
            },
            itemIdentifier: 'FirstItem',
            itemPosition: 0
        },
        testConfig: {
            forceEnableLinearNextItemWarning: true
        },
        item: {
            informational: false
        },
        isLinear : true
    }]).test('Dialog will be triggered ', function(caseData, assert) {
        const ready = assert.async();

        const runner = runnerFactory(providerName, {}, {
            options : caseData.testConfig
        });
        const plugin = pluginFactory(runner, runner.getAreaBroker());

        // mock test store init
        runner.getTestStore = function() {
            return {
                getStore: function() {
                    return Promise.reject();
                },
                setVolatile: function() {}
            };
        };
        runner.getCurrentItem = () => caseData.item;
        runner.getCurrentPart = () => Object.assign({
            isLinear : caseData.isLinear
        }, testMap.part);

        assert.expect(1);

        plugin
            .init()
            .then(function() {
                runner.setTestContext(caseData.testContext);
                runner.setTestMap(testMap);

                runner.on('disablenav', function() {
                    assert.ok(true, 'The dialog interrupted the move');
                    runner.destroy();
                    ready();
                });
                runner.trigger('move', caseData.event);
            })
            .catch(function(err) {
                assert.ok(false, err.message);
                ready();
            });
    });
});
