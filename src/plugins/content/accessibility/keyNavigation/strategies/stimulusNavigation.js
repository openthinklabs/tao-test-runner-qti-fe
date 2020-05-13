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

import $ from 'jquery';
import keyNavigator from 'ui/keyNavigation/navigator';
import navigableDomElement from 'ui/keyNavigation/navigableDomElement';
import {
    setupItemsNavigator
} from 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/helpers';

/**
* The identifier the keyNavigator group
* @type {String}
*/
const groupId = 'stimulus-element-navigation-group';

/**
 * Key navigator strategy applying on stimulus items with scrollbar.
 * Navigable item content are body elements with the special class "stimulus-container".
 * @type {Object} keyNavigationStrategy
 */
export default {
    name: 'stimulus',

    /**
     * Builds the item navigation strategy.
     *
     * @returns {keyNavigationStrategy}
     */
    init() {
        const config = this.getConfig();
        this.keyNavigators = [];

        const $content = this.getTestRunner().getAreaBroker().getContentArea();
        $content
            .find('.stimulus-container')
            // filter out nodes without scrollbar
            .filter(function () {
                return this.scrollHeight > this.clientHeight;
            })
            .addClass('key-navigation-scrollable')
            .each((i, el) => {
                const $element = $(el);
                const navigator = keyNavigator({
                    id: `${groupId}-${i}`,
                    elements: navigableDomElement.createFromDoms($element),
                    group: $element,
                    propagateTab: false
                });

                setupItemsNavigator(navigator, config);
                this.keyNavigators.push(navigator);
            });

        return this;
    },

    /**
     * Gets the list of applied navigators
     * @returns {keyNavigator[]}
     */
    getNavigators() {
        return this.keyNavigators;
    },

    /**
     * Tears down the keyNavigator strategy
     * @returns {keyNavigationStrategy}
     */
    destroy() {
        this.keyNavigators.forEach(navigator => navigator.destroy());
        this.keyNavigators = [];

        return this;
    }
};
