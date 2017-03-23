/** @file Provides clients to AWS Firehose, whose data is imported into AWS Redshift. */

import AWS from 'aws-sdk';

/**
 * A barebones client for posting data to an AWS Firehose stream.
 * Usage:
 *   firehoseClient.putRecord(
 *     'analysis-events',
 *     {
 *       created_at: new Date().toISOString(),             // REQUIRED
 *       environment: 'production',          // REQUIRED
 *       study: 'underwater basket weaving', // REQUIRED
 *       study_group: 'control',             // OPTIONAL
 *       user_id: current_user.id,           // OPTIONAL
 *       script_id: script.id,               // OPTIONAL
 *       level_id: level.id,                 // OPTIONAL
 *       project_id: project.id              // OPTIONAL
 *       event: 'drowning',                  // REQUIRED
 *       data_int: 2                         // OPTIONAL
 *       data_float: 0.31                    // OPTIONAL
 *       data_string: 'code.org rocks'       // OPTIONAL
 *       data_json: JSON.stringify(x)        // OPTIONAL
 *     }
 *   );
 * Usage:
 *   firehoseClient.putRecordBatch(
 *     'analysis-events',
 *     [
 *       {
 *         created_at: new Date().toISOString(),             // REQUIRED
 *         environment: 'production',          // REQUIRED
 *         study: 'underwater basket weaving', // REQUIRED
 *         study_group: 'control',             // OPTIONAL
 *         user_id: current_user.id,           // OPTIONAL
 *         script_id: script.id,               // OPTIONAL
 *         level_id: level.id,                 // OPTIONAL
 *         project_id: project.id              // OPTIONAL
 *         event: 'drowning',                  // REQUIRED
 *         data_int: 2                         // OPTIONAL
 *         data_float: 0.31                    // OPTIONAL
 *         data_string: 'code.org rocks'       // OPTIONAL
 *         data_json: JSON.stringify(x)        // OPTIONAL
 *       },
 *       {
 *         created_at: new Date().toISOString(),             // REQUIRED
 *         environment: 'production',          // REQUIRED
 *         study: 'underwater basket weaving', // REQUIRED
 *         study_group: 'control',             // OPTIONAL
 *         user_id: current_user.id,           // OPTIONAL
 *         script_id: script.id,               // OPTIONAL
 *         level_id: level.id,                 // OPTIONAL
 *         project_id: project.id              // OPTIONAL
 *         event: 'drowning',                  // REQUIRED
 *         data_int: 2                         // OPTIONAL
 *         data_float: 0.31                    // OPTIONAL
 *         data_string: 'code.org rocks'       // OPTIONAL
 *         data_json: JSON.stringify(x)        // OPTIONAL
 *       },
 *     ]
 *   );
 */
// TODO(asher): Add the ability to queue records individually, to be submitted
// as a batch.
class FirehoseClient {
  /**
   * Returns whether the environment appears to be the test environment.
   * @return {boolean} Whether the hostname is "test.code.org" or
   *   "test-studio.code.org".
   */
  isTestEnvironment() {
    if (window && window.location) {
      const hostname = window.location.hostname;
      if ("test.code.org" === hostname || "test-studio.code.org" === hostname) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns whether the environment appears to be a development environment.
   * @return {boolean} Whether the hostname includes "localhost".
   */
  isDevelopmentEnvironment() {
    if (window && window.location) {
      const hostname = window.location.hostname;
      if (hostname.includes("localhost")) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns whether the request should be sent through to AWS Firehose.
   * @param {boolean} alwaysPut An override to default environment behavior.
   * @return {boolean} Whether the request should be sent through to AWS
   *   Firehose.
   */
  shouldPutRecord(alwaysPut) {
    if (alwaysPut) {
      return true;
    }
    if (this.isTestEnvironment() || this.isDevelopmentEnvironment()) {
      return false;
    }
    return true;
  }

  /**
   * Pushes one data record into the delivery stream.
   * @param {string} deliveryStreamName The name of the delivery stream.
   * @param {hash} data The data to push.
   * @param {boolean} alwaysPut Force the record to be sent.
   *   (default false)
   */
  putRecord(deliveryStreamName, data, alwaysPut = false) {
    if (!this.shouldPutRecord(alwaysPut)) {
      console.groupCollapsed("Skipped sending record to " + deliveryStreamName);
      console.log(data);
      console.groupEnd();
      return;
    }

    FIREHOSE.putRecord(
      {
        DeliveryStreamName: deliveryStreamName,
        Record: {
          Data: JSON.stringify(data),
        },
      },
      function (err, data) {
        if (err) {
          // TODO(asher): This is here to assist debugging and should be removed
          // when it is no longer useful.
          console.error("Error pushing event data" + err);
        }
      }
    );
  }

  /**
   * Pushes an array of data records into the delivery stream.
   * @param {string} deliveryStreamName The name of the delivery stream.
   * @param {array[hash]} data The data to push.
   * @param {boolean} alwaysPut Force the record to be sent.
   */
  putRecordBatch(deliveryStreamName, data, alwaysPut = false) {
    if (!this.shouldPutRecord(alwaysPut)) {
      console.groupCollapsed("Skipped sending record batch to " + deliveryStreamName);
      data.map(function (record) {
        console.log(record);
      });
      console.groupEnd();
      return;
    }

    const batch = data.map(function (record) {
      return {
        Data: JSON.stringify(record)
      };
    });

    FIREHOSE.putRecordBatch(
      {
        DeliveryStreamName: deliveryStreamName,
        Records: batch
      },
      function (err, data) {
        if (err) {
          // TODO(asher): This is here to assist debugging and should be removed
          // when it is no longer useful.
          console.error("Error pushing event data" + err);
        }
      }
    );
  }
}

// This code sets up an AWS config against a very restricted user, so this is
// not a concern, we just don't want to make things super obvious. For the
// plaintext, contact asher or eric.
// eslint-disable-next-line
const _0x12ed=['\x41\x4b\x49\x41\x4a\x41\x41\x4d\x42\x59\x4d\x36\x55\x53\x59\x54\x34\x35\x34\x51','\x78\x4e\x4e\x39\x4e\x79\x32\x61\x6d\x39\x78\x75\x4b\x79\x57\x39\x53\x2b\x4e\x76\x41\x77\x33\x67\x68\x68\x74\x68\x72\x6b\x37\x6b\x6e\x51\x59\x54\x77\x6d\x4d\x48','\x75\x73\x2d\x65\x61\x73\x74\x2d\x31','\x63\x6f\x6e\x66\x69\x67'];(function(_0xb54a92,_0x4e682a){var _0x44f3e8=function(_0x35c55a){while(--_0x35c55a){_0xb54a92['\x70\x75\x73\x68'](_0xb54a92['\x73\x68\x69\x66\x74']());}};_0x44f3e8(++_0x4e682a);}(_0x12ed,0x127));var _0xd12e=function(_0x2cedd5,_0x518781){_0x2cedd5=_0x2cedd5-0x0;var _0x4291ea=_0x12ed[_0x2cedd5];return _0x4291ea;};AWS[_0xd12e('0x0')]=new AWS['\x43\x6f\x6e\x66\x69\x67']({'\x61\x63\x63\x65\x73\x73\x4b\x65\x79\x49\x64':_0xd12e('0x1'),'\x73\x65\x63\x72\x65\x74\x41\x63\x63\x65\x73\x73\x4b\x65\x79':_0xd12e('0x2'),'\x72\x65\x67\x69\x6f\x6e':_0xd12e('0x3')});

const FIREHOSE = new AWS.Firehose({apiVersion: '2015-08-04'});
const firehoseClient = new FirehoseClient();
export default firehoseClient;
