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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

define([
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/navigation/allowSkipping',
    'taoQtiTest/runner/helpers/currentItem'
], function (runnerFactory, providerMock, pluginFactory, currentItemHelper) {
    'use strict';

    const providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    //Mock the isAnswered helper, using testRunner property
    currentItemHelper.isAnswered = testRunner => testRunner.answered;

    //Mock the getDeclarations helper, using testRunner property
    currentItemHelper.getDeclarations = testRunner => testRunner.responses;

    /**
     * The following tests applies to all plugins
     */
    QUnit.module('pluginFactory');

    QUnit.test('module', assert => {
        const runner = runnerFactory(providerName);

        assert.equal(typeof pluginFactory, 'function', 'The pluginFactory module exposes a function');
        assert.equal(typeof pluginFactory(runner), 'object', 'The plugin factory produces an instance');
        assert.notStrictEqual(
            pluginFactory(runner),
            pluginFactory(runner),
            'The plugin factory provides a different instance on each call'
        );
    });

    QUnit.cases.init([
        {
            name: 'init',
            title: 'init'
        },
        {
            name: 'render',
            title: 'render'
        },
        {
            name: 'finish',
            title: 'finish'
        },
        {
            name: 'destroy',
            title: 'destroy'
        },
        {
            name: 'trigger',
            title: 'trigger'
        },
        {
            name: 'getTestRunner',
            title: 'getTestRunner'
        },
        {
            name: 'getAreaBroker',
            title: 'getAreaBroker'
        },
        {
            name: 'getConfig',
            title: 'getConfig'
        },
        {
            name: 'setConfig',
            title: 'setConfig'
        },
        {
            name: 'getState',
            title: 'getState'
        },
        {
            name: 'setState',
            title: 'setState'
        },
        {
            name: 'show',
            title: 'show'
        },
        {
            name: 'hide',
            title: 'hide'
        },
        {
            name: 'enable',
            title: 'enable'
        },
        {
            name: 'disable',
            title: 'disable'
        }
    ]).test('plugin API ', (data, assert) => {
        const runner = runnerFactory(providerName);
        const timer = pluginFactory(runner);
        assert.equal(
            typeof timer[data.name],
            'function',
            `The pluginFactory instances expose a "${data.name}" function`
        );
    });

    QUnit.module('Behavior');

    QUnit.cases
        .init([
            {
                title: 'when the option is not enabled',
                context: {
                    itemIdentifier: 'item-1'
                },
                options: {
                    enableAllowSkipping: false
                },
                allowSkipping: false,
                answered: false,
                responses: ['foo']
            },
            {
                title: 'when the item has no interactions',
                context: {
                    itemIdentifier: 'item-1'
                },
                options: {
                    enableAllowSkipping: true
                },
                allowSkipping: false,
                answered: false,
                responses: []
            },
            {
                title: 'when the item is allowed to be skipped',
                context: {
                    itemIdentifier: 'item-1',
                    allowSkipping: true
                },
                options: {
                    enableAllowSkipping: true
                },
                allowSkipping: true,
                answered: false,
                responses: ['foo']
            },
            {
                title: 'when the item is answered',
                context: {
                    itemIdentifier: 'item-1'
                },
                options: {
                    enableAllowSkipping: true
                },
                allowSkipping: false,
                answered: true,
                responses: ['foo']
            }
        ])
        .test('Moving is allowed ', (data, assert) => {
            const ready = assert.async();
            const runner = runnerFactory(providerName, {
                options: data.options
            });
            const plugin = pluginFactory(runner, runner.getAreaBroker());

            runner.getCurrentItem = () => ({ allowSkipping: data.allowSkipping });

            assert.expect(1);

            plugin
                .init()
                .then(() => {
                    runner.setTestContext(data.context);
                    runner.answered = data.answered;
                    runner.responses = data.responses;

                    runner.on('move', () => {
                        assert.ok(true, 'Move is allowed');
                        ready();
                        return Promise.reject();
                    });
                    runner.trigger('move');
                })
                .catch(err => {
                    assert.ok(false, err.message);
                    ready();
                });
        });

    QUnit.cases
        .init([
            {
                title: 'when the item not answered',
                context: {
                    itemIdentifier: 'item-1'
                },
                options: {
                    enableAllowSkipping: true
                },
                allowSkipping: false,
                answered: false,
                responses: ['foo']
            }
        ])
        .test('Moving is prevented ', (data, assert) => {
            const ready = assert.async();

            const runner = runnerFactory(providerName, {}, {
                options: data.options
            });
            const plugin = pluginFactory(runner, runner.getAreaBroker());

            runner.getCurrentItem = () => ({
                allowSkipping: data.allowSkipping,
                answered: data.answered
            });

            assert.expect(2);

            plugin
                .init()
                .then(() => {
                    runner.setTestContext(data.context);
                    runner.answered = data.answered;
                    runner.responses = data.responses;

                    runner.on('move', () => {
                        assert.ok(false, 'Move is denied');
                        ready();
                    });
                    runner.off('alert.notallowed').on('alert.notallowed', (message, cb) => {
                        assert.equal(
                            message,
                            'A response to this item is required.',
                            'The user receive the correct message'
                        );
                        cb();
                    });
                    runner.on('resumeitem', () => {
                        assert.ok(true, 'Move has been prevented');
                        ready();
                    });
                    runner.trigger('move');
                })
                .catch(err => {
                    assert.ok(false, err.message);
                    ready();
                });
        });
});
