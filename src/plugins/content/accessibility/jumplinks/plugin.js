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

/**
 * @author aliaksandr paliakou <lecosson@gmail.com>
 */

import $ from 'jquery';
import pluginFactory from 'taoTests/runner/plugin';
import jumplinksFactory from "./jumplinks";
import shortcutsFactory from "./shortcuts";

function findFocusable(targetElement) {
    const $elem = $(targetElement)
        .find(":not(.hidden)[tabindex]").first();
    return $elem;
}

/**
 * close shortcuts popup
 */
function closeShortcuts() {
    this.shortcuts.hide();
    this.shortcuts.getElement().off("click", this.closeShortcuts);
    $(window).off("keydown", this.closeShortcuts);
}

/**
 * Creates the JumpLinks plugin.
 * adding jumplinks accessibility feature for quick navigation
 */
export default pluginFactory({
    name: 'jumplinks',

    /**
     * Initializes the plugin (called during runner's init)
     */
    init: function init() {
        const mapJumpToAreaBroker = {
            question: 'getContentArea',
            navigation: 'getNavigationArea',
            toolbox: 'getToolboxArea',
            teststatus: 'getPanelArea',
        };
        this.jumplinks = jumplinksFactory({})
            .on('render', () => {
                const closeShortcutsHandler = closeShortcuts.bind(this);
                this.jumplinks.on('jump', (jump) => {
                    const $element = this.getAreaBroker()[mapJumpToAreaBroker[jump]]().find(":not(.hidden)[tabindex]").first();
                    $element.focus();
                });
                this.jumplinks.on('shortcuts', () => {
                    this.shortcuts.show();
                    this.shortcuts.getElement()
                        .off("click", closeShortcutsHandler)
                        .on("click", closeShortcutsHandler);
                    $(window)
                        .off("keydown", closeShortcutsHandler)
                        .on("keydown", closeShortcutsHandler);
                });
            });
        this.shortcuts = shortcutsFactory({});

    },

    /**
     * Called during the runner's render phase
     */
    render: function render() {
        this.jumplinks.render(this.getAreaBroker().getControlArea());
        this.shortcuts.render(this.getAreaBroker().getControlArea());
    },

});
