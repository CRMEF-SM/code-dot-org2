import {expect} from '../../../util/configuredChai';
import sinon from 'sinon';
import {replaceOnWindow, restoreOnWindow} from '../../../util/testUtils';
import * as utils from '@cdo/apps/utils';
import project from '@cdo/apps/code-studio/initApp/project';
import {files as filesApi} from '@cdo/apps/clientApi';
import header from '@cdo/apps/code-studio/header';
import msg from '@cdo/locale';

describe('project.js', () => {
  let sourceHandler;

  beforeEach(() => {
    sourceHandler = createStubSourceHandler();
    replaceAppOptions();
    sinon.stub(utils, 'reload');
    sinon.stub(header, 'showMinimalProjectHeader');
    sinon.stub(header, 'updateTimestamp');
  });

  afterEach(() => {
    utils.reload.restore();
    header.showMinimalProjectHeader.restore();
    header.updateTimestamp.restore();
    restoreAppOptions();
  });

  describe('getNewProjectName()', () => {
    it('for applab', () => {
      window.appOptions.app = 'applab';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameAppLab());
    });

    it('for gamelab', () => {
      window.appOptions.app = 'gamelab';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameGameLab());
    });

    it('for weblab', () => {
      window.appOptions.app = 'weblab';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameWebLab());
    });

    it('for artist', () => {
      window.appOptions.app = 'turtle';
      window.appOptions.skinId = 'artist';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameArtist());
    });

    it('for artist_zombie', () => {
      window.appOptions.app = 'turtle';
      window.appOptions.skinId = 'artist_zombie';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameArtist());
    });

    it('for anna', () => {
      window.appOptions.app = 'turtle';
      window.appOptions.skinId = 'anna';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameFrozen());
    });

    it('for elsa', () => {
      window.appOptions.app = 'turtle';
      window.appOptions.skinId = 'elsa';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameFrozen());
    });

    it('for Big Game', () => {
      window.appOptions.app = 'studio';
      window.appOptions.level = {useContractEditor: true};
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameBigGame());
    });

    it('for Play Lab', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'studio';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNamePlayLab());
    });

    it('for infinity', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'infinity';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameInfinity());
    });

    it('for gumball', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'gumball';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameGumball());
    });

    it('for iceage', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'iceage';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameIceAge());
    });

    it('for Star Wars', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'hoc2015';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameStarWars());
    });

    it('for craft', () => {
      window.appOptions.app = 'craft';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameMinecraft());
    });

    it('for flappy', () => {
      window.appOptions.app = 'flappy';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameFlappy());
    });

    it('for bounce', () => {
      window.appOptions.app = 'bounce';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameBounce());
    });

    it('for sports', () => {
      window.appOptions.app = 'bounce';
      window.appOptions.skinId = 'sports';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameSports());
    });

    it('for basketball', () => {
      window.appOptions.app = 'bounce';
      window.appOptions.skinId = 'basketball';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameBasketball());
    });

    it('for dance', () => {
      window.appOptions.app = 'dance';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectNameDance());
    });

    it('default case', () => {
      window.appOptions.app = 'someOtherType';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectName());
    });
  });

  describe('project.getProjectUrl', function () {

    let stubUrl;
    let url;

    beforeEach(function () {
      stubUrl = sinon.stub(project, 'getUrl').callsFake(() => url);
    });

    afterEach(function () {
      stubUrl.restore();
    });

    it('typical url', function () {
      url = 'http://url';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view');
    });

    it('with ending slashes', function () {
      url = 'http://url//';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view');
    });

    it('with query string', function () {
      url = 'http://url?query';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view?query');
    });

    it('with hash', function () {
      url = 'http://url#hash';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view');
    });

    it('with ending slashes, query, and hash', function () {
      url = 'http://url/?query#hash';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view?query');
    });
  });

  describe('project.getShareUrl', () => {
    let fakeLocation;
    const fakeProjectId = '<project-id>';

    const ORIGINS = [
      {
        studio: 'https://studio.code.org',
        codeProjects: 'https://codeprojects.org',
      },
      {
        studio: 'https://test-studio.code.org',
        codeProjects: 'https://test.codeprojects.org',
      },
      {
        studio: 'https://staging-studio.code.org',
        codeProjects: 'https://staging.codeprojects.org',
      },
      {
        studio: 'http://localhost-studio.code.org:3000',
        codeProjects: 'http://localhost.codeprojects.org:3000',
      },
    ];

    const NORMAL_APP_TYPES = [
      'artist',
      'playlab',
      'applab',
      'gamelab',
    ];

    const CODEPROJECTS_APP_TYPES = [
      'weblab'
    ];

    beforeEach(() => {
      sinon.stub(project, 'getLocation').callsFake(() => fakeLocation);
      sinon.stub(project, 'getCurrentId').returns(fakeProjectId);
      sinon.stub(project, 'getStandaloneApp');
    });

    afterEach(() => {
      project.getStandaloneApp.restore();
      project.getCurrentId.restore();
      project.getLocation.restore();
    });

    function setFakeLocation(url) {
      fakeLocation = document.createElement('a');
      fakeLocation.href = url;
    }

    ORIGINS.forEach(({studio: origin, codeProjects: codeProjectsOrigin}) => {
      describe(`on ${origin}`, () => {
        NORMAL_APP_TYPES.forEach((appType) => {
          const expected = `${origin}/projects/${appType}/${fakeProjectId}`;
          describe(`${appType} projects share to ${expected}`, () => {
            beforeEach(() => project.getStandaloneApp.returns(appType));

            it(`from project edit page`, () => {
              setFakeLocation(`${origin}/projects/${appType}/${fakeProjectId}/edit`);
              expect(project.getShareUrl()).to.equal(expected);
            });

            it(`from a script level`, () => {
              setFakeLocation(`${origin}/s/csp3/stage/10/puzzle/4`);
              expect(project.getShareUrl()).to.equal(expected);
            });
          });
        });

        CODEPROJECTS_APP_TYPES.forEach((appType) => {
          const expected = `${codeProjectsOrigin}/${fakeProjectId}`;
          describe(`${appType} projects share to ${expected}`, () => {
            beforeEach(() => project.getStandaloneApp.returns(appType));

            it(`from project edit page`, () => {
              setFakeLocation(`${origin}/projects/${appType}/${fakeProjectId}/edit`);
              expect(project.getShareUrl()).to.equal(expected);
            });

            it(`from project view page`, () => {
              setFakeLocation(`${origin}/projects/${appType}/${fakeProjectId}/view`);
              expect(project.getShareUrl()).to.equal(expected);
            });

            it(`from a script level`, () => {
              setFakeLocation(`${origin}/s/csp3/stage/10/puzzle/4`);
              expect(project.getShareUrl()).to.equal(expected);
            });
          });
        });
      });
    });
  });

  describe('toggleMakerEnabled()', () => {
    beforeEach(() => {
      sinon.stub(project, 'saveSourceAndHtml_').callsFake((source, callback) => {
        callback();
      });
    });

    afterEach(() => {
      project.saveSourceAndHtml_.restore();
    });

    it('performs a save with maker enabled if it was disabled', () => {
      sourceHandler.getMakerAPIsEnabled.returns(false);
      project.init(sourceHandler);
      return project.toggleMakerEnabled().then(() => {
        expect(project.saveSourceAndHtml_).to.have.been.called;
        expect(project.saveSourceAndHtml_.getCall(0).args[0].makerAPIsEnabled).to.be.true;
      });
    });

    it('performs a save with maker disabled if it was enabled', () => {
      sourceHandler.getMakerAPIsEnabled.returns(true);
      project.init(sourceHandler);
      return project.toggleMakerEnabled().then(() => {
        expect(project.saveSourceAndHtml_).to.have.been.called;
        expect(project.saveSourceAndHtml_.getCall(0).args[0].makerAPIsEnabled).to.be.false;
      });
    });

    it('always results in a page reload', () => {
      project.init(sourceHandler);
      expect(utils.reload).not.to.have.been.called;
      return project.toggleMakerEnabled().then(() => {
        expect(utils.reload).to.have.been.called;
      });
    });
  });

  describe('selectedSong()', () => {
    beforeEach(() => {
      project.init(sourceHandler);
    });

    it('saves selected song', () => {
      return project.saveSelectedSong('peas').then(() => {
        expect(sourceHandler.setSelectedSong).to.have.been.called;
      });
    });
  });

  describe('copy() (client-side remix)', () => {
    let server;

    beforeEach(() => {
      sinon.stub(project, 'getStandaloneApp').returns('artist');
      server = sinon.createFakeServer({autoRespond: true});
      project.init(sourceHandler);
    });

    afterEach(() => {
      server.restore();
      project.getStandaloneApp.restore();
    });

    it('performs a client-side remix', async () => {
      stubPostChannels(server);
      stubPutMainJson(server);
      await project.copy('Remixed project');
    });

    it('does not pass currentVersion and replace params on remix', async () => {
      stubPostChannels(server);
      stubPutMainJson(server);
      project.__TestInterface.setCurrentSourceVersionId('fakeid');
      await project.copy('Remixed project');
      expect(server.requests[1].url).to.match(/main.json/);
      expect(server.requests[1].url).not.to.match(/currentVersion=/);
      expect(server.requests[1].url).not.to.match(/replace=(true|false)/);
    });
  });

  describe('project.saveThumbnail', () => {
    const STUB_CHANNEL_ID = 'STUB-CHANNEL-ID';
    const STUB_BLOB = 'stub-binary-data';

    beforeEach(() => {
      sinon.stub(filesApi, 'putFile');

      const projectData = {
        id: STUB_CHANNEL_ID,
        isOwner: true
      };
      project.updateCurrentData_(null, projectData);
    });

    afterEach(() => {
      project.updateCurrentData_(null, undefined);

      filesApi.putFile.restore();
    });

    it('calls filesApi.putFile with correct parameters', () => {
      project.saveThumbnail(STUB_BLOB);

      expect(filesApi.putFile).to.have.been.calledOnce;
      const call = filesApi.putFile.getCall(0);
      expect(call.args[0]).to.equal('.metadata/thumbnail.png');
      expect(call.args[1]).to.equal(STUB_BLOB);
    });

    it('succeeds if filesApi.putFile succeeds', done => {
      filesApi.putFile.callsFake((path, blob, success, error) => success());

      project.saveThumbnail(STUB_BLOB).then(done);
    });

    it('fails if project is not initialized', done => {
      project.__TestInterface.setCurrentData(undefined);

      const promise = project.saveThumbnail(STUB_BLOB);
      promise.catch(e => {
        expect(e).to.contain('Project not initialized');
        expect(filesApi.putFile).not.to.have.been.called;
        done();
      });
    });

    it('fails if project is not owned by the current user', done => {
      project.__TestInterface.setCurrentData({});

      project.saveThumbnail(STUB_BLOB).catch(e => {
        expect(e).to.contain('Project not owned by current user');
        expect(filesApi.putFile).not.to.have.been.called;
        done();
      });
    });

    it('fails if filesApi.putFile fails', done => {
      filesApi.putFile.callsFake((path, blob, success, error) => error('foo'));

      project.saveThumbnail(STUB_BLOB).catch(e => {
        expect(e).to.contain('foo');
        done();
      });
    });
  });
});

function replaceAppOptions() {
  replaceOnWindow('appOptions', {
    level: {
      isProjectLevel: true,
    },
  });
}

function restoreAppOptions() {
  restoreOnWindow('appOptions');
}

function stubPostChannels(server) {
  server.respondWith('POST', /\/v3\/channels/, xhr => {
    xhr.respond(200, {
      'Content-Type': 'application/json',
    }, JSON.stringify({
      "createdAt": "2018-10-22T21:59:43.000-07:00",
      "updatedAt": "2018-10-22T21:59:45.000-07:00",
      "isOwner": true,
      "publishedAt": null,
      "level": "/projects/artist",
      "migratedToS3": true,
      "name": "Remix: allthethings-artist-project-backed",
      "id": "kmz3weHzTpZTbRWrHRzMJA",
      "projectType": "artist"
    }));
  });
}

function stubPutMainJson(server) {
  server.respondWith('PUT', /\/v3\/sources\/.*\/main\.json/, xhr => {
    xhr.respond(200, {
      'Content-Type': 'application/json',
    }, JSON.stringify({
      filename: 'main.json',
      category: 'json',
      size: 0,
      versionId: 12345,
      timestamp: Date.now()
    }));
  });
}

function createStubSourceHandler() {
  return {
    setInitialLevelHtml: sinon.stub(),
    getLevelHtml: sinon.stub(),
    setInitialLevelSource: sinon.stub(),
    getLevelSource: sinon.stub().resolves(),
    setInitialAnimationList: sinon.stub(),
    getAnimationList: sinon.stub().callsFake(cb => cb({})),
    setMakerAPIsEnabled: sinon.stub(),
    getMakerAPIsEnabled: sinon.stub(),
    setSelectedSong: sinon.stub(),
    getSelectedSong: sinon.stub(),
    prepareForRemix: sinon.stub().returns(Promise.resolve()),
  };
}
