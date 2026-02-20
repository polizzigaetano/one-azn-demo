/* global PureJSSelectors */

const SIDEKICK_ID = 'igkmdomcgoebiipaifhmpfjhbjccggml';
const PLUGIN_ID = 'content-advisor';

const DM_OPENAPI_API_STYLE = 'openapi';
const DM_SCENE7_API_STYLE = 'scene7';
const ASSET_REPO_NAME_KEY = 'repo:name';
const ASSET_REPO_ID_KEY = 'repo:id';
const REPO_ID_KEY = 'repo:repositoryId';

/* ---------- Dynamic Media URL helpers ---------- */

function getModifierString(selectedMedia) {
  const { modifiers } = selectedMedia;
  if (modifiers && modifiers.length > 0) {
    return modifiers.join('&');
  }
  return null;
}

function buildDMOpenApiUrl(selectedMedia, repoMetadata) {
  const {
    base, preset, smartcrop, modifiers,
  } = selectedMedia;
  const dmDomain = repoMetadata?.[REPO_ID_KEY]?.replace('author-', 'delivery-');
  const assetName = repoMetadata?.[ASSET_REPO_NAME_KEY];
  const assetId = repoMetadata?.[ASSET_REPO_ID_KEY];
  const seoName = assetName?.split('.')[0];
  const assetFormat = repoMetadata?.['dc:format'];

  let dmUrl;
  if (assetFormat && assetFormat.startsWith('video/')) {
    dmUrl = `https://${dmDomain}/adobe/assets/${assetId}/play`;
  } else {
    dmUrl = `https://${dmDomain}/adobe/assets/${assetId}/as/${seoName}.avif`;
    if (!base && preset) {
      dmUrl = `${dmUrl}?preset=${preset}`;
    } else if (!base && smartcrop) {
      dmUrl = `${dmUrl}?smartcrop=${smartcrop}`;
    }
    if (modifiers) {
      const modifierString = getModifierString(selectedMedia);
      if (modifierString) {
        dmUrl = base ? `${dmUrl}?${modifierString}` : `${dmUrl}&${modifierString}`;
      }
    }
  }
  return dmUrl;
}

function buildDMScene7Url(selectedMedia, repoMetadata) {
  const {
    base, preset, smartcrop, modifiers,
  } = selectedMedia;
  let scene7Domain = repoMetadata?.['repo:scene7Domain'];
  const scene7File = repoMetadata?.['repo:scene7File'];

  if (!scene7Domain || !scene7File) return null;

  if (scene7Domain.startsWith('http://')) {
    scene7Domain = scene7Domain.replace('http://', 'https://');
  }
  if (!scene7Domain.endsWith('/')) {
    scene7Domain = `${scene7Domain}/`;
  }

  let dmUrl;
  if (base) {
    dmUrl = `${scene7Domain}is/image/${base}`;
  } else if (preset) {
    dmUrl = `${scene7Domain}is/image/${scene7File}?$${preset}$`;
  } else if (smartcrop) {
    dmUrl = `${scene7Domain}is/image/${scene7File}:${smartcrop}`;
  }

  if (modifiers && dmUrl) {
    const modifierString = getModifierString(selectedMedia);
    if (modifierString) {
      dmUrl = preset ? `${dmUrl}&${modifierString}` : `${dmUrl}?${modifierString}`;
    }
  }
  return dmUrl;
}

function createDMUrlFromSelectedMedia(selectedMedia, repoMetadata) {
  if (!selectedMedia?.apiStyle) return null;

  if (selectedMedia.apiStyle === DM_OPENAPI_API_STYLE) {
    return buildDMOpenApiUrl(selectedMedia, repoMetadata);
  }
  if (selectedMedia.apiStyle === DM_SCENE7_API_STYLE) {
    return buildDMScene7Url(selectedMedia, repoMetadata);
  }
  return null;
}

/* ---------- Sidekick palette helpers ---------- */

function closePalette() {
  try {
    window.chrome?.runtime?.sendMessage?.(SIDEKICK_ID, {
      id: PLUGIN_ID,
      action: 'closePalette',
    });
  } catch {
    // not in Chrome extension context
  }
}

function sendSelectionToParent(assets) {
  const enriched = assets.map((asset) => {
    const result = { ...asset };
    if (asset?.selectedMedia) {
      result.dmUrl = createDMUrlFromSelectedMedia(asset.selectedMedia, asset);
    }
    return result;
  });

  window.parent.postMessage(
    { type: 'content-advisor-selection', assets: enriched },
    '*',
  );
}

/* ---------- Build external brief from referrer page ---------- */

async function buildExternalBrief() {
  const params = new URLSearchParams(window.location.search);
  const referrer = params.get('ref');
  if (!referrer) return '';

  try {
    const res = await fetch(referrer);
    if (!res.ok) return '';
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const main = doc.querySelector('main');
    return main ? main.innerText.trim() : doc.body.innerText.trim();
  } catch {
    return '';
  }
}

/* ---------- Initialise Asset Selector MFE ---------- */

async function init() {
  const container = document.getElementById('asset-selector-container');
  const loading = document.getElementById('loading');

  const externalBrief = await buildExternalBrief();

  const defaultFeatures = ['upload', 'collections', 'detail-panel'];

  const props = {
    featureSet: [
      ...defaultFeatures,
      'advisor',
      'content-fragments',
    ],
    externalBrief,
    handleSelection: (assets) => {
      sendSelectionToParent(assets);
    },
    onClose: () => {
      closePalette();
    },
  };

  if (typeof PureJSSelectors !== 'undefined') {
    PureJSSelectors.renderAssetSelectorWithAuthFlow(container, props);
    loading.classList.add('hidden');
  } else {
    loading.querySelector('p').textContent = 'Failed to load Asset Selector MFE. Ensure it is available.';
  }
}

/* ---------- Close button ---------- */

document.querySelector('.close-btn')?.addEventListener('click', closePalette);

/* ---------- Load the Asset Selector MFE and start ---------- */

const MFE_SCRIPT_URL = 'https://experience.adobe.com/solutions/CQ-assets-selectors/static-assets/resources/assets-selectors.js';

const script = document.createElement('script');
script.src = MFE_SCRIPT_URL;
script.onload = () => init();
script.onerror = () => {
  const loading = document.getElementById('loading');
  loading.querySelector('p').textContent = 'Failed to load Asset Selector script.';
};
document.head.appendChild(script);
