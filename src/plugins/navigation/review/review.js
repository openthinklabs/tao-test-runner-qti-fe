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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test Runner Control Plugin : Review panel
 *
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

import _ from 'lodash';
import __ from 'i18n';
import 'ui/hider';
import shortcut from 'util/shortcut';
import namespaceHelper from 'util/namespace';
import pluginFactory from 'taoTests/runner/plugin';
import mapHelper from 'taoQtiTest/runner/helpers/map';
import navigatorFactory from 'taoQtiTest/runner/plugins/navigation/review/navigator';

/**
 * The display states of the buttons
 */
var buttonData = {
    setFlag: {
        control: 'set-item-flag',
        title: __('Flag the current item for later review'),
        icon: 'anchor',
        text: __('Flag for Review')
    },
    unsetFlag: {
        control: 'unset-item-flag',
        title: __('Do not flag the current item for later review'),
        icon: 'anchor',
        text: __('Unflag for Review')
    },
    showReview: {
        control: 'show-review',
        title: __('Show the review screen'),
        icon: 'right',
        text: __('Show Review')
    },
    hideReview: {
        control: 'hide-review',
        title: __('Hide the review screen'),
        icon: 'left',
        text: __('Hide Review')
    }
};

/**
 * Gets the definition of the flagItem button related to the context
 * @param {Object} context - the test context
 * @returns {Object}
 */
function getFlagItemButtonData(context) {
    var dataType = context.itemFlagged ? 'unsetFlag' : 'setFlag';
    return buttonData[dataType];
}

/**
 * Gets the definition of the toggleNavigator button related to the context
 * @param {Object} navigator - the navigator component
 * @returns {Object}
 */
function getToggleButtonData(navigator) {
    var dataType = navigator.is('hidden') ? 'showReview' : 'hideReview';
    return buttonData[dataType];
}

/**
 * Update the button based on the provided data
 * @param {Component} button - the element to update
 * @param {Object} data - the button data
 */
function updateButton(button, data) {
    var $button = button.getElement();
    if (button.is('rendered')) {
        if ($button.data('control') !== data.control) {
            $button.data('control', data.control).attr('title', data.title);

            $button.find('.icon').attr('class', `icon icon-${  data.icon}`);
            $button.find('.text').text(data.text);

            if (_.contains(data.control, 'flag')) {
                if (button.is('active')) {
                    button.turnOff();
                } else {
                    button.turnOn();
                }
            }
        }
    }
}

/**
 * Checks if the current context allows to mark the item for review
 * @param {Object} testRunner
 * @returns {Boolean}
 */
function canFlag(testRunner) {
    const testContext = testRunner.getTestContext();
    const testMap = testRunner.getTestMap();
    const item = mapHelper.getItemAt(testMap, testContext.itemPosition);
    const markReviewCategory = mapHelper.hasItemCategory(
        testMap,
        testContext.itemIdentifier,
        'markReview',
        true
    );

    return !!(!testContext.isLinear && markReviewCategory && !(item && item.informational));
}

/**
 * Creates the timer plugin
 */
export default pluginFactory({
    name: 'review',

    /**
     * Initializes the plugin (called during runner's init)
     */
    init: function init() {
        const self = this;
        const testRunner = this.getTestRunner();

        const testContext = testRunner.getTestContext();
        const testMap = testRunner.getTestMap();

        const testRunnerOptions = testRunner.getOptions();
        const pluginShortcuts = (testRunnerOptions.shortcuts || {})[this.getName()] || {};
        const navigatorConfig = testRunnerOptions.review || {
            defaultOpen : false
        };
        let previousItemPosition;

        /**
         * Retrieve the review categories of the current item
         * @returns {Object} the calculator categories
         */
        function getReviewCategories(){
            const currentContext = testRunner.getTestContext();
            const currentMap = testRunner.getTestMap();

            return {
                reviewScreen : mapHelper.hasItemCategory(
                    currentMap,
                    currentContext.itemIdentifier,
                    'reviewScreen',
                    true
                ),
                markReview : mapHelper.hasItemCategory(
                    currentMap,
                    currentContext.itemIdentifier,
                    'markReview',
                    true
                )
            };
        }

        /**
         * Tells if the component is enabled
         * @returns {Boolean}
         */
        function isPluginAllowed() {
            const categories = getReviewCategories();
            return navigatorConfig.enabled && categories.reviewScreen;
        }

        /**
         * Get the flagged value for the item at that position
         * @param {Number} position - the item position
         * @returns {Boolean}
         */
        function isItemFlagged(position) {
            const map = testRunner.getTestMap();
            const item = mapHelper.getItemAt(map, position);
            return !!item.flagged;
        }

        /**
         * Mark an item for review
         * @param {Number} position
         * @param {Boolean} flag
         * @returns {Promise}
         */
        function flagItem(position, flag) {
            self.disable();

            return testRunner
                .getProxy()
                .callTestAction('flagItem', {
                    position: position,
                    flag: flag
                })
                .then(function() {
                    const context = testRunner.getTestContext();
                    const map     = testRunner.getTestMap();
                    const item    = mapHelper.getItemAt(map, position);

                    //update the value in the current testMap
                    item.flagged = flag;

                    // update the display of the flag button
                    updateButton(self.flagItemButton, getFlagItemButtonData(context));

                    // update the item state
                    self.navigator.setItemFlag(position, flag);
                    self.enable();
                })
                .catch(function() {
                    // rollback on the item flag
                    self.navigator.setItemFlag(position, !flag);
                    self.enable();
                });
        }

        /**
         * Mark the current item for review
         */
        function flagCurrentItem() {
            const context = testRunner.getTestContext();
            const flagStatus = isItemFlagged(context.itemPosition);
            if (self.getState('enabled') !== false) {
                flagItem(context.itemPosition, !flagStatus);
            }
        }

        /**
         * Shows/hides the review panel
         *
         * @param [{Boolean} forcedState], true will show the panel
         */
        function togglePanel(forcedState) {
            var isHidden = _.isUndefined(forcedState) ? self.navigator.is('hidden') : forcedState;
            if (isHidden) {
                self.explicitlyHidden = false;
                self.navigator.show();
            } else {
                self.explicitlyHidden = true;
                self.navigator.hide();
            }
            updateButton(self.toggleButton, getToggleButtonData(self.navigator));
        }

        this.navigator = navigatorFactory(navigatorConfig, testMap, testContext)
            .on('selected', function(position, previousPosition) {
                previousItemPosition = previousPosition;
            })
            .on('jump', function(position) {
                if (self.getState('enabled') !== false) {
                    self.disable();
                    testRunner.jump(position, 'item');
                }
            })
            .on('flag', function(position, flag) {
                if (self.getState('enabled') !== false) {
                    flagItem(position, flag);
                }
            })
            .render();

        // restore current item in the navigator if movement not allowed
        testRunner.on('alert.notallowed', function() {
            self.navigator.select(previousItemPosition);
        });

        this.explicitlyHidden = false;

        // register buttons in the toolbox component
        this.toggleButton = this.getAreaBroker()
            .getToolbox()
            .createEntry(getToggleButtonData(this.navigator));
        this.toggleButton.on('click', function(e) {
            e.preventDefault();
            testRunner.trigger('tool-reviewpanel');
        });

        this.flagItemButton = this.getAreaBroker()
            .getToolbox()
            .createEntry(getFlagItemButtonData(testContext));
        this.flagItemButton.on('click', function(e) {
            e.preventDefault();
            testRunner.trigger('tool-flagitem');
        });

        if (testRunnerOptions.allowShortcuts) {
            if (pluginShortcuts.flag) {
                shortcut.add(
                    namespaceHelper.namespaceAll(pluginShortcuts.flag, this.getName(), true),
                    function() {
                        testRunner.trigger('tool-flagitem');
                    },
                    {
                        avoidInput: true
                    }
                );
            }

            if (pluginShortcuts.toggle) {
                shortcut.add(
                    namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true),
                    function() {
                        testRunner.trigger('tool-reviewpanel');
                    },
                    {
                        avoidInput: true
                    }
                );
            }
        }

        if (!isPluginAllowed()) {
            this.hide();
        }

        //disabled by default
        this.disable();

        togglePanel(navigatorConfig.defaultOpen);

        //change plugin state
        testRunner
            .on('render', function() {
                if (isPluginAllowed()) {
                    self.show();
                    updateButton(self.toggleButton, getToggleButtonData(self.navigator));
                } else {
                    self.hide();
                }
            })
            .on('loaditem', function() {
                const context = testRunner.getTestContext();
                const map = testRunner.getTestMap();
                const categories = getReviewCategories();

                if (isPluginAllowed()) {
                    updateButton(self.flagItemButton, getFlagItemButtonData(context));
                    self.navigator.update(map, context).updateConfig({
                        canFlag: !context.isLinear && categories.markReview
                    });
                    self.show();
                    updateButton(self.toggleButton, getToggleButtonData(self.navigator));
                } else {
                    self.hide();
                }
            })
            .on('enabletools enablenav', function() {
                if (isPluginAllowed()) {
                    self.enable();
                }
            })
            .on('disabletools disablenav', function() {
                if (isPluginAllowed()) {
                    self.disable();
                }
            })
            .on('hidenav', function() {
                self.hide();
            })
            .on('shownav', function() {
                if (isPluginAllowed()) {
                    self.show();
                }
            })
            .on('tool-flagitem', function() {
                if (isPluginAllowed() && canFlag(testRunner)) {
                    flagCurrentItem();
                }
            })
            .on('tool-reviewpanel', function() {
                if (isPluginAllowed() && self.getState('enabled')) {
                    togglePanel();
                }
            });
    },

    /**
     * Called during the runner's render phase
     */
    render: function render() {
        var areaBroker = this.getAreaBroker();
        var $panelContainer = areaBroker.getPanelArea();
        $panelContainer.append(this.navigator.getElement());
    },

    /**
     * Called during the runner's destroy phase
     */
    destroy: function destroy() {
        shortcut.remove(`.${  this.getName()}`);
        this.navigator.destroy();
    },

    /**
     * Enables the button
     */
    enable: function enable() {
        var testRunner = this.getTestRunner();
        var testContext = testRunner.getTestContext();

        this.flagItemButton.enable();
        this.toggleButton.enable();
        this.navigator.enable();
        if (testContext.itemFlagged) {
            this.flagItemButton.turnOn();
        } else {
            this.flagItemButton.turnOff();
        }
    },

    /**
     * Disables the button
     */
    disable: function disable() {
        this.flagItemButton.disable();
        this.flagItemButton.turnOff();

        this.toggleButton.disable();

        this.navigator.disable();
    },

    /**
     * Shows the button
     */
    show: function show() {
        var testRunner = this.getTestRunner();
        if (canFlag(testRunner)) {
            this.flagItemButton.show();
        } else {
            this.flagItemButton.hide();
        }
        this.toggleButton.show();

        if (!this.explicitlyHidden) {
            this.navigator.show();
        } else {
            this.navigator.hide();
        }
    },

    /**
     * Hides the button
     */
    hide: function hide() {
        this.flagItemButton.hide();
        this.toggleButton.hide();
        this.navigator.hide();
    }
});
