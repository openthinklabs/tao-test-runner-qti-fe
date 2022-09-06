import pluginFactory from "taoTests/runner/plugin";
import __ from 'i18n';

/**
 * Returns the configured plugin
 */
export default pluginFactory({
  name: "autoSave",

  init: function init() {
    var self = this;
    var areaBroker = this.getAreaBroker();

    this.button = areaBroker.getToolbox().createEntry({
      control: "autoSave",
      text: __('Auto Save'),
      title: __('Auto Save'),
      icon: "clock",
    });

    //this.getTestRunner().on('loaditem', function(){
    this.getTestRunner()
      .on("enabletools loaditem renderitem", function () {
        if (document.querySelector(".qti-extendedTextInteraction")) {
          var testContext = self.getTestRunner().getTestContext();
          var testPartId = testContext.testPartId;
          var sectionId = testContext.sectionId;
          var itemIdentifier = testContext.itemIdentifier;

          var testMap = self.getTestRunner().getTestMap();
          var categories =
            testMap.parts[testPartId].sections[sectionId].items[itemIdentifier]
              .categories;

          window.endTime = new Date().getTime() + 300000; //autosave every 5 minutes

          //if(categories.includes('autoSave')){

          //if allow skip enable, hide the button #UKP requirement
          if($('[data-control=skip]').length) {
            $('[data-control=skip]').remove();
          }
          
          self.show();

          window.timer = setInterval(function () {
            var now = new Date().getTime();
            var distance = window.endTime - now;

            var minutes = Math.floor(
              (distance % (1000 * 60 * 60)) / (1000 * 60)
            );
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if(document.querySelector('li[data-control="autoSave"]')) {
              document.querySelector('li[data-control="autoSave"]').innerHTML =
              __('Autosave in') + " " + minutes + "m " + seconds + "s";

              if (distance == 0) {
                document.querySelector('li[data-control="autoSave"]').innerHTML =
                __('Autosaving..');
                window.clearInterval(window.timer);
                self
                  .getTestRunner()
                  .jump(self.getTestRunner().getTestContext()["itemPosition"]);
              }
            }
          });
        } else {
          self.hide();
        }
      })
      .on("unloaditem unrenderitem move skip next previous jump", function () {
        window.clearInterval(window.timer);
        self.disable();
      });
  },

  render: function render() {},

  destroy: function destroy() {
    if (this.button && this.button.length) {
      this.button.off("click");
    }
  },

  enable: function enable() {
    this.button.enable();
  },

  disable: function disable() {
    this.button.disable();
  },

  show: function show() {
    this.button.show();
  },

  hide: function hide() {
    this.button.hide();
  },
});
