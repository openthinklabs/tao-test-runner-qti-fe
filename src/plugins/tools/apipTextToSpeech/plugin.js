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
 * Copyright (c) 2016-2019  (original work) Open Assessment Technologies SA;
 *
 * @author Anton Tsymuk <anton@taotesting.com>
 */

import _ from 'lodash';
import __ from 'i18n';
import 'ui/hider';
import shortcut from 'util/shortcut';
import namespaceHelper from 'util/namespace';
import pluginFactory from 'taoTests/runner/plugin';
import mapHelper from 'taoQtiTest/runner/helpers/map';
import keyNavigator from 'ui/keyNavigation/navigator';
import navigableDomElement from 'ui/keyNavigation/navigableDomElement';
import ttsComponentFactory from 'taoQtiTest/runner/plugins/tools/apipTextToSpeech/textToSpeech';

const pluginName = 'apiptts';

const actionPrefix = `tool-${pluginName}-`;

/**
 * Returns the configured plugin
 */
export default pluginFactory({
    name: pluginName,

    /**
     * Initialize the plugin (called during runner's init)
     */
    init() {
        const testRunner = this.getTestRunner();
        const testRunnerOptions = testRunner.getOptions();
        const pluginShortcuts = (testRunnerOptions.shortcuts || {})[this.getName()] || {};
        let ttsComponent = null;

        /**
         * Creates the tts component on demand
         * @returns {textToSpeech}
         */
        const getTTSComponent = () => {
            if (!ttsComponent) {
                const $container = testRunner.getAreaBroker().getContainer();

                ttsComponent = ttsComponentFactory($container, {})
                    .on('close', () => {
                        testRunner.trigger(`${actionPrefix}toggle`);
                    });
            }

            return ttsComponent;
        };

        /**
         * Checks if the plugin is currently available.
         * To be activated with the special category x-tao-option-apiptts
         *
         * @returns {Boolean}
         */
        const isConfigured = () => mapHelper.hasItemCategory(
            testRunner.getTestMap(),
            testRunner.getTestContext().itemIdentifier,
            'apiptts',
            true
        );

        /**
         * Is plugin activated ? if not, then we hide the plugin
         */
        const togglePlugin = () => {
            if (isConfigured()) {
                this.show();
            } else {
                this.hide();
            }
        };

        /**
         * Show the plugin panel
         *
         * @fires plugin-open.apiptts
         */
        const enablePlugin = () => {
            getTTSComponent();

            this.navigationGroup && this.navigationGroup.focus();

            this.button.turnOn();
            this.setState('active', true);

            this.trigger('open');

            if (ttsComponent.is('hidden')) {
                ttsComponent.show();
            }
        };

        /**
         * Hide the plugin panel
         *
         * @fires plugin-close.apiptts
         */
        const disablePlugin = () => {
            this.navigationGroup && this.navigationGroup.blur();

            this.setState('active', false);

            this.button.turnOff();
            this.trigger('close');

            if (ttsComponent && !ttsComponent.is('hidden')) {
                ttsComponent.hide();
            }
        };

        /**
         * Shows/hides the plugin
         */
        const toggleTool = () => {
            if (this.getState('enabled')) {
                if (this.getState('active')) {
                    disablePlugin();
                } else {
                    enablePlugin();
                }
            }
        };

        // Add plugin button to toolbox
        this.button = this.getAreaBroker()
            .getToolbox()
            .createEntry({
                className: `${this.getName()}-plugin`,
                control: this.getName(),
                icon: 'headphones',
                text: __('Text To Speech'),
                title: __('Enable text to speech'),
            });

        // Handle plugin button click
        this.button.on('click', (e) => {
            e.preventDefault();
            testRunner.trigger(`${actionPrefix}toggle`);
        });

        // Register plugin shortcuts
        if (testRunnerOptions.allowShortcuts) {
            _.forEach(pluginShortcuts, (command, key) => {
                shortcut.add(
                    namespaceHelper.namespaceAll(command, pluginName, true),
                    () => {
                        const eventKey = key.endsWith('TogglePlayback') ? 'togglePlayback' : key;

                        testRunner.trigger(actionPrefix + eventKey);
                    },
                    {
                        avoidInput: true
                    }
                );
            });
        }

        //start disabled
        togglePlugin();
        this.disable();

        //update plugin state based on changes
        testRunner
            .on('loaditem', () => {
                togglePlugin();
                this.disable();
            })
            .on('enabletools renderitem', () => {
                this.enable();
            })
            .on('disabletools unloaditem', () => {
                disablePlugin();
                this.disable();
            })
            .on(`${actionPrefix}toggle`, () => {
                if (isConfigured()) {
                    toggleTool();
                }
            })
            .on(`${actionPrefix}togglePlayback`, () => {
            })
            .on(`${actionPrefix}next`, () => {
                if (this.getState('enabled')) {
                    if (this.getState('active')) {
                        // handling goes here
                    }
                }
            })
            .on(`${actionPrefix}previous`, () => {
                if (this.getState('enabled')) {
                    if (this.getState('active')) {
                        // handling goes here
                    }
                }
            })
            .on('renderitem', () => {
                const $navigationGroupElement = this.button.getElement();
                const groupNavigationId = `${pluginName}_navigation_group`;

                if (!$navigationGroupElement) {
                    return;
                }

                this.navigationGroup = keyNavigator({
                    id: groupNavigationId,
                    elements: navigableDomElement.createFromDoms($navigationGroupElement),
                    group: $navigationGroupElement,
                    replace: true,
                    propagateTab: false,
                })
                    .on('tab', () => {
                        testRunner.trigger(`${actionPrefix}next`);
                    })
                    .on('shift+tab', () => {
                        testRunner.trigger(`${actionPrefix}previous`);
                    });
            });
    },
    /**
     * Called during the runner's destroy phase
     */
    destroy() {
        shortcut.remove(`.${this.getName()}`);
    },
    /**
     * Enable the button
     */
    enable() {
        this.button.enable();
    },
    /**
     * Disable the button
     */
    disable() {
        this.button.disable();
    },
    /**
     * Show the button
     */
    show() {
        this.button.show();
    },
    /**
     * Hide the button
     */
    hide() {
        this.button.hide();
    }
});
