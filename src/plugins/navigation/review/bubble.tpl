<li class="qti-navigator-item {{cls}}" data-id="{{id}}" data-position="{{position}}">
    <button
        class="qti-navigator-label step"
        {{#if active}}class="current"{{/if}}
        aria-disabled="{{#if viewed}}false{{else}}true{{/if}}"
        {{#if active}}aria-current='location'{{/if}}
        role="link"
        aria-label="{{index}} of {{../stats.total}} {{icon}}">
        {{#if active}}<span class="{{#if active}}icon-indicator {{/if}}indicator" aria-hidden="true"></span>{{/if}}
        <span class="icon-{{icon}}" aria-hidden="true"></span>
        <span class="step-label" aria-hidden="true">{{position}}</span>
    </button>
</li>
