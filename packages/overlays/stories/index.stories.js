import { storiesOf, html, withKnobs } from '@open-wc/demoing-storybook';
import { css, render, LitElement } from '@lion/core';
import {
  withBottomSheetConfig,
  withDropdownConfig,
  withModalDialogConfig,
  OverlayMixin,
} from '../index.js';

function renderOffline(litHtmlTemplate) {
  const offlineRenderContainer = document.createElement('div');
  render(litHtmlTemplate, offlineRenderContainer);
  return offlineRenderContainer.firstElementChild;
}

// Currently toggling while opened doesn't work (see OverlayController)
/*
let toggledPlacement = 'top';
const togglePlacement = popupController => {
  const placements = [
    'top-end',
    'top',
    'top-start',
    'right-end',
    'right',
    'right-start',
    'bottom-start',
    'bottom',
    'bottom-end',
    'left-start',
    'left',
    'left-end',
  ];
  toggledPlacement = placements[(placements.indexOf(toggledPlacement) + 1) % placements.length];
  popupController.updatePopperConfig({ togglePlacement });
};
*/

const overlayDemoStyle = css`
  .demo-box {
    width: 200px;
    background-color: white;
    border-radius: 2px;
    border: 1px solid grey;
    padding: 8px;
  }

  .demo-box_placements {
    display: flex;
    flex-direction: column;
    width: 173px;
    margin: 0 auto;
    margin-top: 68px;
  }

  lion-demo-overlay {
    padding: 10px;
  }

  .close-button {
    color: black;
    font-size: 28px;
    line-height: 28px;
  }

  .demo-box__column {
    display: flex;
    flex-direction: column;
  }

  .demo-overlay {
    display: block;
    position: absolute;
    font-size: 16px;
    color: white;
    background-color: black;
    border-radius: 4px;
    padding: 8px;
  }

  .demo-overlay button {
    color: black;
  }

  .demo-popup {
    padding: 10px;
    border: 1px solid black;
  }
`;

customElements.define(
  'lion-demo-overlay',
  class extends OverlayMixin(LitElement) {
    // eslint-disable-next-line class-methods-use-this
    _defineOverlayConfig() {
      return {
        placementMode: 'global', // have to set a default
      };
    }

    _setupOpenCloseListeners() {
      this.__toggle = () => {
        this.opened = !this.opened;
      };
      this._overlayInvokerNode.addEventListener('click', this.__toggle);
    }

    _teardownOpenCloseListeners() {
      this._overlayInvokerNode.removeEventListener('click', this.__toggle);
    }

    render() {
      return html`
        <slot name="invoker"></slot>
        <slot name="content"></slot>
        <slot name="_overlay-shadow-outlet"></slot>
      `;
    }
  },
);

storiesOf('Overlay System | Overlay as a WC', module)
  .addDecorator(withKnobs)
  .add(
    'Default',
    () => html`
      <style>
        ${overlayDemoStyle}
      </style>
      <p>
        Important note: For <code>placementMode: 'global'</code>, your
        <code>slot="content"</code> gets moved to global overlay container. After initialization it
        is no longer a child of <code>lion-demo-overlay</code>
      </p>
      <p>
        To close your overlay from some action performed inside the content slot, fire a
        <code>hide</code> event.
      </p>
      <p>
        For the overlay to close, it will need to bubble to the content slot (use
        <code>bubbles: true</code>. If absolutely needed <code>composed: true</code> can be used to
        traverse shadow boundaries)
      </p>
      <p>The demo below demonstrates this</p>
      <div class="demo-box">
        <lion-demo-overlay>
          <button slot="invoker">Overlay</button>
          <div slot="content" class="demo-overlay">
            Hello! You can close this notification here:
            <button
              class="close-button"
              @click=${e => e.target.dispatchEvent(new Event('hide', { bubbles: true }))}
            >
              ⨯
            </button>
          </div>
        </lion-demo-overlay>
      </div>
    `,
  )
  .add('Global placement configuration', () => {
    const overlay = placement => html`
      <lion-demo-overlay
        .config=${{ hasBackdrop: true, trapsKeyboardFocus: true, viewportConfig: { placement } }}
      >
        <button slot="invoker">Overlay ${placement}</button>
        <div slot="content" class="demo-overlay">
          Hello! You can close this notification here:
          <button
            class="close-button"
            @click=${e => e.target.dispatchEvent(new Event('hide', { bubbles: true }))}
          >
            ⨯
          </button>
        </div>
      </lion-demo-overlay>
    `;

    return html`
      <style>
        ${overlayDemoStyle}
      </style>
      <div class="demo-box_placements">
        ${overlay('center')} ${overlay('top-left')} ${overlay('top-right')}
        ${overlay('bottom-left')} ${overlay('bottom-right')}
      </div>
    `;
  })
  .add(
    'Nested overlays',
    () => html`
      <style>
        ${overlayDemoStyle}
      </style>
      <lion-demo-overlay .config=${{ ...withModalDialogConfig() }}>
        <button slot="invoker">Overlay</button>
        <div slot="content" class="demo-overlay">
          <div>
            Hello! This is a notification.
            <button @click=${e => e.target.dispatchEvent(new Event('hide', { bubbles: true }))}>
              Close
            </button>
            <lion-demo-overlay
              .config=${{ ...withModalDialogConfig(), viewportConfig: { placement: 'top' } }}
            >
              <button slot="invoker">Open child</button>
              <div slot="content" class="demo-overlay">
                Hello! You can close this notification here:
                <button
                  class="close-button"
                  @click=${e => e.target.dispatchEvent(new Event('hide', { bubbles: true }))}
                >
                  ⨯
                </button>
              </div>
            </lion-demo-overlay>
          </div>
        </div>
      </lion-demo-overlay>
    `,
  )
  .add(
    'Local placementMode',
    () => html`
      <style>
        ${overlayDemoStyle}
      </style>
      <div class="demo-box_placements">
        <lion-demo-overlay
          .config=${{ placementMode: 'local', popperConfig: { placement: 'bottom-start' } }}
        >
          <button slot="invoker">Overlay</button>
          <div slot="content" class="demo-overlay">
            Hello! You can close this notification here:
            <button
              class="close-button"
              @click=${e => e.target.dispatchEvent(new Event('hide', { bubbles: true }))}
            >
              ⨯
            </button>
          </div>
        </lion-demo-overlay>
      </div>
    `,
  )
  .add(
    'Override the popper config',
    () => html`
      <style>
        ${overlayDemoStyle}
      </style>
      <div>
        The API is aligned with Popper.js, visit their documentation for more information:
        <a href="https://popper.js.org/popper-documentation.html">Popper.js Docs</a>
      </div>
      <div class="demo-box_placements">
        <lion-demo-overlay
          .config=${{
            placementMode: 'local',
            hidesOnEsc: true,
            hidesOnOutsideClick: true,
            popperConfig: {
              placement: 'bottom-end',
              positionFixed: true,
              modifiers: {
                keepTogether: {
                  enabled: true /* Prevents detachment of content element from reference element */,
                },
                preventOverflow: {
                  enabled: true /* disables shifting/sliding behavior on secondary axis */,
                  boundariesElement: 'viewport',
                  padding: 32 /* when enabled, this is the viewport-margin for shifting/sliding on secondary axis */,
                },
                hide: {
                  /* must come AFTER preventOverflow option */
                  enabled: false /* disables hiding behavior when reference element is outside of popper boundaries */,
                },
                offset: {
                  enabled: true,
                  offset: `0, 16px` /* horizontal and vertical margin (distance between popper and referenceElement) */,
                },
              },
            },
          }}
        >
          <div slot="content" class="demo-popup">United Kingdom</div>
          <button slot="invoker">
            UK
          </button>
        </lion-demo-overlay>
      </div>
    `,
  )
  .add('Switch overlays configuration', () => {
    const overlay = renderOffline(html`
      <lion-demo-overlay .config=${{ ...withBottomSheetConfig() }}>
        <button slot="invoker">Overlay</button>
        <div slot="content" class="demo-overlay">
          Hello! You can close this notification here:
          <button
            class="close-button"
            @click=${e => e.target.dispatchEvent(new Event('hide', { bubbles: true }))}
          >
            ⨯
          </button>
        </div>
      </lion-demo-overlay>
    `);

    return html`
      <style>
        ${overlayDemoStyle}
      </style>
      <div>
        <button
          @click=${() => {
            overlay.config = {
              ...withModalDialogConfig(),
            };
          }}
        >
          modal dialog
        </button>
        <button
          @click=${() => {
            overlay.config = {
              ...withBottomSheetConfig(),
            };
          }}
        >
          bottom sheet
        </button>
        <button
          @click=${() => {
            overlay.config = {
              ...withDropdownConfig(),
            };
          }}
        >
          dropdown
        </button>
      </div>
      <div class="demo-box_placements">
        ${overlay}
      </div>
    `;
  })
  .add(
    'Responsive switching',
    () => html`
      <style>
        ${overlayDemoStyle}
      </style>
      <p>Open the overlay on a big screen and it will be a dialog</p>
      <p>Close and open it again on a small screen (< 600px) and it will be a bottom sheet</p>
      <lion-demo-overlay
        .config=${{ ...withBottomSheetConfig() }}
        @before-show=${e => {
          if (window.innerWidth >= 600) {
            e.target.config = { ...withModalDialogConfig() };
          } else {
            e.target.config = { ...withBottomSheetConfig() };
          }
        }}
      >
        <button slot="invoker">Overlay</button>
        <div slot="content" class="demo-overlay">
          Hello! You can close this notification here:
          <button
            class="close-button"
            @click=${e => e.target.dispatchEvent(new Event('hide', { bubbles: true }))}
          >
            ⨯
          </button>
        </div>
      </lion-demo-overlay>
    `,
  )
  .add('On hover', () => {
    const popup = renderOffline(html`
      <lion-demo-overlay
        .config=${{
          placementMode: 'local',
          hidesOnEsc: true,
          hidesOnOutsideClick: true,
          popperConfig: {
            placement: 'bottom',
          },
        }}
      >
        <span
          slot="invoker"
          @mouseenter=${() => {
            popup.opened = true;
          }}
          @mouseleave=${() => {
            popup.opened = false;
          }}
          >UK</span
        >
        <div slot="content" class="demo-overlay">
          United Kingdom
        </div>
      </lion-demo-overlay>
    `);

    return html`
      <style>
        ${overlayDemoStyle}
      </style>
      <div class="demo-box_placements">
        <p>In the beautiful ${popup} the weather is nice.</p>
      </div>
    `;
  })
  .add('On an input', () => {
    const popup = renderOffline(html`
      <lion-demo-overlay
        .config=${{
          placementMode: 'local',
          elementToFocusAfterHide: null,
          popperConfig: {
            placement: 'bottom',
          },
        }}
      >
        <div slot="content" class="demo-popup">United Kingdom</div>
        <input
          slot="invoker"
          id="input"
          type="text"
          autocomplete="off"
          @click=${e => e.stopImmediatePropagation()}
          @focusout=${() => {
            popup.opened = false;
          }}
          @focusin=${() => {
            popup.opened = true;
          }}
        />
      </lion-demo-overlay>
    `);

    return html`
      <style>
        ${overlayDemoStyle}
      </style>
      <div class="demo-box_placements">
        <label for="input">Input with a dropdown on focus</label>
        ${popup}
      </div>
    `;
  });

/* .add('Toggle placement with knobs', () => {
    const overlay = (placementMode = 'global') => html`
      <lion-demo-overlay
        .config=${{
          placementMode,
          ...(placementMode === 'global'
            ? { viewportConfig: { placement: text('global config', 'center') } }
            : { popperConfig: { placement: text('local config', 'top-start') } }),
        }}
      >
        <button slot="invoker">Overlay</button>
        <div slot="content" class="demo-overlay">
          Hello! You can close this notification here:
          <button
            class="close-button"
            @click=${e => e.target.dispatchEvent(new Event('hide', { bubbles: true }))}
            >⨯</button
          >
        </div>
      </lion-demo-overlay>
    `;

    return html`
      <style>
        ${overlayDemoStyle}
      </style>
      <div class="demo-box_placements">
        <p>Local</p>
        ${overlay('local')}
      </div>

      <div class="demo-box_placements">
        <p>Global</p>
        ${overlay()}
      </div>
    `;
  }) */
