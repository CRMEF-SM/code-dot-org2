/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
/* global $ */
'use strict';

var utils = require('../utils');
var _ = utils.getLodash();
var i18n = require('../../locale/current/netsim');
var NetSimPanel = require('./NetSimPanel');
var markup = require('./NetSimRemoteNodeSelectionPanel.html');
var NodeType = require('./netsimConstants').NodeType;

/**
 * Generator and controller for lobby node listing, selection, and connection
 * controls.
 *
 * @param {jQuery} rootDiv
 * @param {netsimLevelConfiguration} levelConfig
 * @param {NetSimNode[]} nodesOnShard
 * @param {NetSimNode[]} incomingConnectionNodes
 * @param {NetSimNode} selectedNode
 * @param {NetSimNode} remoteNode - null if not attempting to connect
 * @param {number} myNodeID
 * @param {function} addRouterCallback
 * @param {function} selectNodeCallback
 * @param {function} connectButtonCallback
 * @param {function} cancelButtonCallback
 * @constructor
 * @augments NetSimPanel
 */
var NetSimRemoteNodeSelectionPanel = module.exports = function (rootDiv,
    levelConfig, nodesOnShard, incomingConnectionNodes, selectedNode,
    remoteNode, myNodeID, addRouterCallback, selectNodeCallback,
    connectButtonCallback, cancelButtonCallback) {
  /**
   * @type {netsimLevelConfiguration}
   * @private
   */
  this.levelConfig_ = levelConfig;

  /**
   * @type {NetSimNode[]}
   * @private
   */
  this.nodesOnShard_ = nodesOnShard;

  /**
   * @type {NetSimNode[]}
   * @private
   */
  this.incomingConnectionNodes_ = incomingConnectionNodes;

  /**
   * Which node in the lobby is currently selected
   * @type {NetSimNode}
   * @private
   */
  this.selectedNode_ = selectedNode;

  /**
   * @type {NetSimNode}
   * @private
   */
  this.remoteNode_ = remoteNode;

  /**
   * @type {number}
   * @private
   */
  this.myNodeID_ = myNodeID;

  /**
   * Handler for "Add Router" button
   * @type {function}
   * @private
   */
  this.addRouterCallback_ = addRouterCallback;

  /**
   * Handler for selecting a node row
   * @type {function}
   * @private
   */
  this.selectNodeCallback_ = selectNodeCallback;

  /**
   * Handler for connect button
   * @type {function}
   * @private
   */
  this.connectButtonCallback_ = connectButtonCallback;

  /**
   * Handler for cancel button (backs out of non-mutual connection)
   * @type {function}
   * @private
   */
  this.cancelButtonCallback_ = cancelButtonCallback;

  // Initial render
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim-lobby-panel',
    panelTitle: i18n.connectToANode(),
    canMinimize: false
  });
};
NetSimRemoteNodeSelectionPanel.inherits(NetSimPanel);

/**
 * Recreate markup within panel body.
 */
NetSimRemoteNodeSelectionPanel.prototype.render = function () {
  // Create boilerplate panel markup
  NetSimRemoteNodeSelectionPanel.superPrototype.render.call(this);

  // Add our own content markup
  var newMarkup = $(markup({
    level: this.levelConfig_,
    nodesOnShard: this.nodesOnShard_,
    incomingConnectionNodes: this.incomingConnectionNodes_,
    selectedNode: this.selectedNode_,
    remoteNode: this.remoteNode_,
    canConnectToNode: this.canConnectToNode_.bind(this),
    isMyNode: this.isMyNode_.bind(this)
  }));
  this.getBody().html(newMarkup);

  this.addRouterButton_ = this.getBody().find('#netsim_lobby_add_router');
  this.addRouterButton_.click(this.addRouterCallback_);

  this.connectButton_ = this.getBody().find('#netsim_lobby_connect');
  this.connectButton_.click(this.connectButtonCallback_);

  this.cancelButton_ = this.getBody().find('#netsim_lobby_cancel');
  this.cancelButton_.click(this.cancelButtonCallback_);

  this.getBody().find('.selectable-row').click(this.onRowClick_.bind(this));
};

/**
 * @param {Event} jQueryEvent
 * @private
 */
NetSimRemoteNodeSelectionPanel.prototype.onRowClick_ = function (jQueryEvent) {
  var target = $(jQueryEvent.target);
  var nodeID = target.data('nodeId');
  var clickedNode = _.find(this.nodesOnShard_, function (node) {
    return node.entityID === nodeID;
  });

  // Don't even allow clicking on nodes we can't connect to.
  if (!clickedNode || !this.canConnectToNode_(clickedNode)) {
    return;
  }

  // If the selected node was clicked, we want to deselect.
  if (this.selectedNode_ && this.selectedNode_.entityID === clickedNode.entityID) {
    this.selectNodeCallback_(null);
  } else {
    this.selectNodeCallback_(clickedNode);
  }
};

/**
 * @param {NetSimNode} node
 * @returns {boolean}
 * @private
 */
NetSimRemoteNodeSelectionPanel.prototype.isMyNode_ = function (node) {
  return this.myNodeID_ === node.entityID;
};

/**
 * Check whether the level configuration allows connections to the specified
 * node.
 * @param {NetSimNode} connectionTarget
 * @returns {boolean} whether connection to the target is allowed
 * @private
 */
NetSimRemoteNodeSelectionPanel.prototype.canConnectToNode_ = function (connectionTarget) {
  // Can't connect to own node
  if (this.isMyNode_(connectionTarget)) {
    return false;
  }

  // Permissible connection limited by level configuration
  var isClient = (connectionTarget.getNodeType() === NodeType.CLIENT);
  var isRouter = (connectionTarget.getNodeType() === NodeType.ROUTER);
  var allowClients = this.levelConfig_.canConnectToClients;
  var allowRouters = this.levelConfig_.canConnectToRouters;
  return (isClient && allowClients) || (isRouter && allowRouters);
};
