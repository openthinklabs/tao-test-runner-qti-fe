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
 * Copyright (c) 2020 Open Assessment Technologies SA ;
 */

import _ from "lodash";
import keyNavigator from 'ui/keyNavigation/navigator';
import navigableDomElement from 'ui/keyNavigation/navigableDomElement';
import {allowedToNavigateFrom} from 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/helpers';

/**
 * Key navigator strategy applying onto the navigation panel.
 */
export default {
    name: 'navigator',

    /**
     * Builds the navigator navigation strategy.
     *
     * @param {testRunner} testRunner - the test runner instance to control
     * @param {keyNavigationStrategyConfig} config - the config to apply
     * @returns {keyNavigationStrategy}
     */
    init(testRunner, config) {
        let managedNavigators = [];
        let keyNavigators = [];

        /**
         * @typedef {Object} keyNavigationStrategy
         */
        return {
            /**
             * Setup the keyNavigator strategy
             * @returns {keyNavigationStrategy}
             */
            init() {
                const $panel = testRunner.getAreaBroker().getPanelArea();
                const $navigator = $panel.find('.qti-navigator');
                let filtersNavigator;
                let itemsNavigator;
                let $filters, $trees, navigableFilters, navigableTrees;

                //the tag to identify if the item listing has been browsed, to only "smart jump" to active item only on the first visit
                let itemListingVisited = false;
                //the position of the filter in memory, to only "smart jump" to active item only on the first visit
                let filterCursor;

                if ($navigator.length && !$navigator.hasClass('disabled')) {
                    $filters = $navigator.find('.qti-navigator-filters .qti-navigator-filter');
                    navigableFilters = navigableDomElement.createFromDoms($filters);
                    if (navigableFilters.length) {
                        filtersNavigator = keyNavigator({
                            keepState: config.keepState,
                            id: 'navigator-filters',
                            replace: true,
                            elements: navigableFilters,
                            group: $navigator.find('.qti-navigator-filters')
                        })
                            .on(config.keyNextTab || config.keyNextItem, function (elem) {
                                if (allowedToNavigateFrom(elem)) {
                                    this.next();
                                }
                            })
                            .on(config.keyPrevTab || config.keyPrevItem, function (elem) {
                                if (allowedToNavigateFrom(elem)) {
                                    this.previous();
                                }
                            })
                            .on('activate', cursor => {
                                cursor.navigable.getElement().click();
                            });

                        if (config.keepState) {
                            filtersNavigator.on('focus', (cursor, origin) => {
                                if (config.keepState) {
                                    //activate the tab in the navigators
                                    cursor.navigable.getElement().click();

                                    //reset the item listing browsed tag whenever the focus on the filter happens after a focus on another element
                                    if ((filterCursor && filterCursor.position !== cursor.position) || origin) {
                                        itemListingVisited = false;
                                    }
                                    //set the filter cursor in memory
                                    filterCursor = cursor;
                                }
                            });
                        }

                        if (config.keyNextContent) {
                            filtersNavigator.on(config.keyNextContent, elem => {
                                if (allowedToNavigateFrom(elem) && itemsNavigator) {
                                    _.defer(() => {
                                        if (itemListingVisited) {
                                            itemsNavigator.focus().first();
                                        } else {
                                            itemsNavigator.focus();
                                        }
                                    });
                                }
                            });
                        }
                        if (config.keyPrevContent) {
                            filtersNavigator.on(config.keyPrevContent, elem => {
                                if (allowedToNavigateFrom(elem) && itemsNavigator) {
                                    _.defer(() => {
                                        itemsNavigator.last();
                                    });
                                }
                            });
                        }

                        keyNavigators.push(filtersNavigator);
                        managedNavigators.push(filtersNavigator);
                    }

                    const $navigatorTree = $panel.find('.qti-navigator-tree');
                    $trees = $navigator.find('.qti-navigator-tree .qti-navigator-item:not(.unseen) .qti-navigator-label');
                    navigableTrees = navigableDomElement.createFromDoms($trees);
                    if (navigableTrees.length) {
                        //instantiate a key navigator but do not add it to the returned list of navigators as this is not supposed to be reached with tab key
                        itemsNavigator = keyNavigator({
                            id: 'navigator-items',
                            replace: true,
                            elements: navigableTrees,
                            group: $navigatorTree,
                            defaultPosition(navigables) {
                                let pos = 0;
                                if (filterCursor && filterCursor.navigable.getElement().data('mode') !== 'flagged') {
                                    _.forEach(navigables, function (navigable, i) {
                                        const $parent = navigable.getElement().parent('.qti-navigator-item');
                                        //find the first active and visible item
                                        if ($parent.hasClass('active') && $parent.is(':visible')) {
                                            pos = i;
                                            return false;
                                        }
                                    });
                                }
                                return pos;
                            }
                        })
                            .on(config.keyNextContent || config.keyNextItem, function (elem) {
                                if (allowedToNavigateFrom(elem)) {
                                    this.next();
                                }
                            })
                            .on(config.keyPrevContent || config.keyPrevItem, function (elem) {
                                if (allowedToNavigateFrom(elem)) {
                                    this.previous();
                                }
                            })
                            .on('activate', cursor => {
                                cursor.navigable.getElement().click();
                            })
                            .on('focus', cursor => {
                                itemListingVisited = true;
                                cursor.navigable
                                    .getElement()
                                    .parent()
                                    .addClass('key-navigation-highlight');
                            })
                            .on('blur', cursor => {
                                cursor.navigable
                                    .getElement()
                                    .parent()
                                    .removeClass('key-navigation-highlight');
                            });

                        if (config.keepState) {
                            itemsNavigator.on('lowerbound upperbound', () => {
                                if (filtersNavigator) {
                                    filtersNavigator.focus();
                                }
                            });
                        }

                        if (config.keyNextTab && config.keyPrevTab) {
                            if (config.keyNextTab) {
                                itemsNavigator.on(config.keyNextTab, function (elem) {
                                    if (allowedToNavigateFrom(elem) && filtersNavigator) {
                                        filtersNavigator.focus().next();
                                    }
                                });
                            }

                            if (config.keyPrevTab) {
                                itemsNavigator.on(config.keyPrevTab, function (elem) {
                                    if (allowedToNavigateFrom(elem) && filtersNavigator) {
                                        filtersNavigator.focus().previous();
                                    }
                                });
                            }
                        } else {
                            keyNavigators.push(itemsNavigator);
                        }
                        managedNavigators.push(itemsNavigator);
                    }
                }

                return this;
            },

            /**
             * Gets the list of applied navigators
             * @returns {keyNavigator[]}
             */
            getNavigators() {
                return keyNavigators;
            },

            /**
             * Tears down the keyNavigator strategy
             * @returns {keyNavigationStrategy}
             */
            destroy() {
                managedNavigators.forEach(navigator => navigator.destroy());
                managedNavigators = [];
                keyNavigators = [];

                return this;
            }
        };
    }
};