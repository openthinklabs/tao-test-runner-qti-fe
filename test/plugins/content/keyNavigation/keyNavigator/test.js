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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

define([
    'jquery',
    'lodash',
    'taoTests/runner/runner',
    'taoTests/runner/runnerComponent',
    'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/keyNavigator',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/test/runner/plugins/content/keyNavigation/mock/backend',
    'tpl!taoQtiTest/test/runner/plugins/content/keyNavigation/assets/layout',
    'json!taoQtiTest/test/runner/plugins/content/keyNavigation/data/config-nokb.json',
    'json!taoQtiTest/test/runner/plugins/content/keyNavigation/data/test.json',
    'json!taoQtiTest/test/runner/plugins/content/keyNavigation/data/item.json',
    'json!taoQtiTest/test/runner/plugins/content/keyNavigation/data/rubrics.json',
    'jquery.simulate'
], function (
    $,
    _,
    runnerFactory,
    runnerComponent,
    keyNavigatorFactory,
    providerMock,
    backendMockFactory,
    layoutTpl,
    configData,
    testDefinition,
    itemsBank,
    rubricsBank
) {
    'use strict';

    // KeyCode constants
    const key = $.simulate.keyCode;

    // Wait delay between each cycle step (test the keyboard behavior)
    const cycleDelay = 1;

    const providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    const backendMock = backendMockFactory(testDefinition, itemsBank);

    QUnit.module('keyNavigatorFactory');

    QUnit.test('module', assert => {
        assert.equal(typeof keyNavigatorFactory, 'function', 'The keyNavigatorFactory module exposes a function');
        assert.equal(typeof keyNavigatorFactory(), 'object', 'The keyNavigator factory produces an instance');
        assert.notStrictEqual(
            keyNavigatorFactory(),
            keyNavigatorFactory(),
            'The keyNavigator factory provides a different instance on each call'
        );
    });

    QUnit.cases.init([
        {title: 'init'},
        {title: 'getTestRunner'},
        {title: 'setMode'},
        {title: 'getMode'},
        {title: 'destroy'}
    ]).test('keyNavigator API ', (data, assert) => {
        const keyNavigator = keyNavigatorFactory();
        assert.equal(
            typeof keyNavigator[data.title],
            'function',
            `The keyNavigatorFactory instance exposes a "${data.title}" function`
        );
    });

    QUnit.module('Behavior');

    QUnit.test('Switch the navigation mode', assert => {
        assert.expect(3);

        const config = {
            contentNavigatorType: 'default'
        };
        const keyNavigator = keyNavigatorFactory({}, config);

        assert.equal(keyNavigator.getMode(), 'default', 'The default mode is set');

        keyNavigator.setMode('native');
        assert.equal(keyNavigator.getMode(), 'native', 'The native mode is set');

        keyNavigator.setMode('linear');
        assert.equal(keyNavigator.getMode(), 'linear', 'The linear mode is set');
    });

    QUnit.test('Access the test runner', assert => {
        assert.expect(1);

        const config = {
            contentNavigatorType: 'default'
        };
        const testRunner = {
            init() {}
        };
        const keyNavigator = keyNavigatorFactory(testRunner, config);

        assert.equal(keyNavigator.getTestRunner(), testRunner, 'The test runner is accessible');
    });

    QUnit.cases.init([
        {
            title: 'Default',
            mode: 'default',
            rubrics: rubricsBank,
            cycle: [
                {
                    label: 'Rubrick block',
                    selector: '.qti-rubricBlock',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Item interaction 1',
                    selector: '.qti-interaction input[value="choice_1"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Item interaction 2',
                    selector: '.qti-interaction input[value="choice_2"]',
                    key: {
                        keyCode: key.DOWN
                    }
                }, {
                    label: 'Item interaction 3',
                    selector: '.qti-interaction input[value="choice_3"]',
                    key: {
                        keyCode: key.RIGHT
                    }
                }, {
                    label: 'Item interaction 2',
                    selector: '.qti-interaction input[value="choice_2"]',
                    key: {
                        keyCode: key.UP
                    }
                }, {
                    label: 'Item interaction 1',
                    selector: '.qti-interaction input[value="choice_1"]',
                    key: {
                        keyCode: key.LEFT
                    }
                }, {
                    label: 'Next button',
                    selector: '[data-control="move-forward"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Hide review button',
                    selector: '[data-control="hide-review"]',
                    key: {
                        keyCode: key.LEFT
                    }
                }, {
                    label: 'Home link',
                    selector: '#home',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Logout link',
                    selector: '#logout',
                    key: {
                        keyCode: key.RIGHT
                    }
                }, {
                    label: 'Exit link',
                    selector: '#exit',
                    key: {
                        keyCode: key.RIGHT
                    }
                }, {
                    label: 'Navigation panel All tab',
                    selector: '.qti-navigator-filter[data-mode="all"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Navigation panel Unanswered tab',
                    selector: '.qti-navigator-filter[data-mode="unanswered"]',
                    key: {
                        keyCode: key.RIGHT
                    }
                }, {
                    label: 'Navigation panel Flagged tab',
                    selector: '.qti-navigator-filter[data-mode="flagged"]',
                    key: {
                        keyCode: key.RIGHT
                    }
                }, {
                    label: 'Navigation panel Unanswered tab',
                    selector: '.qti-navigator-filter[data-mode="unanswered"]',
                    key: {
                        keyCode: key.LEFT
                    }
                }, {
                    label: 'Navigation panel current item',
                    selector: '.qti-navigator-item[data-id="item-3"] .qti-navigator-label',
                    key: {
                        keyCode: key.DOWN
                    }
                }, {
                    label: 'Rubrick block',
                    selector: '.qti-rubricBlock',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Item wrapper',
                    selector: 'section.content-wrapper',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }, {
                    label: 'Navigation panel Unanswered tab',
                    selector: '.qti-navigator-filter[data-mode="unanswered"]',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }, {
                    label: 'Home link',
                    selector: '#home',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }, {
                    label: 'Next button',
                    selector: '[data-control="move-forward"]',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }
            ]
        }, {
            title: 'Linear',
            mode: 'linear',
            rubrics: rubricsBank,
            cycle: [
                {
                    label: 'Rubrick block',
                    selector: '.qti-rubricBlock',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Item interaction 1',
                    selector: '.qti-interaction [data-identifier="choice_1"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Item interaction 2',
                    selector: '.qti-interaction [data-identifier="choice_2"]',
                    key: {
                        keyCode: key.RIGHT
                    }
                }, {
                    label: 'Item interaction 3',
                    selector: '.qti-interaction [data-identifier="choice_3"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Item interaction 2',
                    selector: '.qti-interaction [data-identifier="choice_2"]',
                    key: {
                        keyCode: key.LEFT
                    }
                }, {
                    label: 'Item interaction 1',
                    selector: '.qti-interaction [data-identifier="choice_1"]',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }, {
                    label: 'Item interaction 2',
                    selector: '.qti-interaction [data-identifier="choice_2"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Item interaction 3',
                    selector: '.qti-interaction [data-identifier="choice_3"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Next button',
                    selector: '[data-control="move-forward"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Hide review button',
                    selector: '[data-control="hide-review"]',
                    key: {
                        keyCode: key.LEFT
                    }
                }, {
                    label: 'Home link',
                    selector: '#home',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Logout link',
                    selector: '#logout',
                    key: {
                        keyCode: key.RIGHT
                    }
                }, {
                    label: 'Exit link',
                    selector: '#exit',
                    key: {
                        keyCode: key.RIGHT
                    }
                }, {
                    label: 'Navigation panel All tab',
                    selector: '.qti-navigator-filter[data-mode="all"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Navigation panel Unanswered tab',
                    selector: '.qti-navigator-filter[data-mode="unanswered"]',
                    key: {
                        keyCode: key.RIGHT
                    }
                }, {
                    label: 'Navigation panel Flagged tab',
                    selector: '.qti-navigator-filter[data-mode="flagged"]',
                    key: {
                        keyCode: key.RIGHT
                    }
                }, {
                    label: 'Navigation panel Unanswered tab',
                    selector: '.qti-navigator-filter[data-mode="unanswered"]',
                    key: {
                        keyCode: key.LEFT
                    }
                }, {
                    label: 'Navigation panel current item',
                    selector: '.qti-navigator-item[data-id="item-3"] .qti-navigator-label',
                    key: {
                        keyCode: key.DOWN
                    }
                }, {
                    label: 'Rubrick block',
                    selector: '.qti-rubricBlock',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Item wrapper',
                    selector: 'section.content-wrapper',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }, {
                    label: 'Navigation panel Unanswered tab',
                    selector: '.qti-navigator-filter[data-mode="unanswered"]',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }, {
                    label: 'Home link',
                    selector: '#home',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }, {
                    label: 'Next button',
                    selector: '[data-control="move-forward"]',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }
            ]
        }, {
            title: 'Native',
            mode: 'native',
            rubrics: {},
            cycle: [
                    {
                    label: 'Home link',
                    selector: '#home',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Logout link',
                    selector: '#logout',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Exit link',
                    selector: '#exit',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Navigation panel All tab',
                    selector: '.qti-navigator-filter[data-mode="all"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Navigation panel Unanswered tab',
                    selector: '.qti-navigator-filter[data-mode="unanswered"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Navigation panel Flagged tab',
                    selector: '.qti-navigator-filter[data-mode="flagged"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Navigation panel Unanswered tab',
                    selector: '.qti-navigator-filter[data-mode="unanswered"]',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }, {
                    label: 'Navigation panel Flagged tab',
                    selector: '.qti-navigator-filter[data-mode="flagged"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Navigation panel current item',
                    selector: '.qti-navigator-item[data-id="item-3"] .qti-navigator-label',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Item interaction 1',
                    selector: '.qti-interaction input[value="choice_1"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Item interaction 2',
                    selector: '.qti-interaction input[value="choice_2"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Item interaction 3',
                    selector: '.qti-interaction input[value="choice_3"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Item interaction 2',
                    selector: '.qti-interaction input[value="choice_2"]',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }, {
                    label: 'Item interaction 1',
                    selector: '.qti-interaction input[value="choice_1"]',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }, {
                    label: 'Item interaction 2',
                    selector: '.qti-interaction input[value="choice_2"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Item interaction 3',
                    selector: '.qti-interaction input[value="choice_3"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Hide review button',
                    selector: '[data-control="hide-review"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Next button',
                    selector: '[data-control="move-forward"]',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Home link',
                    selector: '#home',
                    key: {
                        keyCode: key.TAB
                    }
                }, {
                    label: 'Next button',
                    selector: '[data-control="move-forward"]',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }, {
                    label: 'Hide review button',
                    selector: '[data-control="hide-review"]',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                },{
                    label: 'Item interaction 3',
                    selector: '.qti-interaction input[value="choice_3"]',
                    key: {
                        keyCode: key.TAB,
                        shiftKey: true
                    }
                }
            ]
        }
    ]).test('Navigation mode ', (data, assert) => {
        const ready = assert.async();
        const $container = $('#qunit-fixture');
        const config = {
            contentNavigatorType: data.mode
        };
        const processCycle = (index, delay = cycleDelay) => new Promise(resolve => {
            const step = data.cycle[index];
            $(document.activeElement).simulate('keydown', step.key);
            setTimeout(() => {
                assert.equal(document.activeElement, $container.find(step.selector).get(0), `${step.label} got the focus`);
                resolve(index + 1);
            }, delay);
        });

        backendMock.setRubricsBank(data.rubrics);

        assert.expect(8 + data.cycle.length);

        assert.equal($container.children().length, 0, 'The container is empty');

        Promise.resolve()
            .then(() => new Promise((resolve, reject) => {
                $container.html(layoutTpl());
                assert.equal($container.children().length, 1, 'The layout is rendered');
                assert.equal($container.find('.runner').children().length, 0, 'The test runner is not rendered yet');

                runnerComponent($container.find('.runner'), _.cloneDeep(configData))
                    .on('error', reject)
                    .on('ready', runner => {
                        assert.equal($container.find('.runner').children().length, 1, 'The test runner is rendered');

                        runner.after('renderitem.runnerComponent', itemRef => {
                            if (itemRef === 'item-1') {
                                runner.next();
                            } else {
                                runner.off('renderitem.runnerComponent');
                                resolve(runner);
                            }
                        });
                    });
            }))
            .then(runner => {
                const keyNavigator = keyNavigatorFactory(runner, config);
                assert.ok(true, 'Test runner up an running');
                keyNavigator.init();

                assert.equal(config.contentNavigatorType, data.mode, `The navigation mode is set to ${data.mode}`);
                assert.equal(keyNavigator.getMode(), data.mode, `The ${data.mode} mode is claimed`);

                let queue = Promise.resolve(0);
                document.activeElement.blur();
                _.times(data.cycle.length, () => queue = queue.then(processCycle));

                return queue.then(() => {
                    keyNavigator.destroy();
                    return runner.destroy();
                });
            })
            .catch(err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
            })
            .then(() => assert.ok(true, 'done!'))
            .then(ready);
    });

});
