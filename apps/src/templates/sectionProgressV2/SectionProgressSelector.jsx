import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import DCDO from '@cdo/apps/dcdo';
import SectionProgress from '../sectionProgress/SectionProgress';
import {setShowProgressTableV2} from '@cdo/apps/templates/currentUserRedux';
import SectionProgressV2 from './SectionProgressV2';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import styles from './progress-header.module.scss';
import Link from '@cdo/apps/componentLibrary/link';

function SectionProgressSelector({
  showProgressTableV2,
  setShowProgressTableV2,
}) {
  const onShowProgressTableV2Change = useCallback(
    e => {
      e.preventDefault();
      const shouldShowV2 = !showProgressTableV2;
      new UserPreferences().setShowProgressTableV2(shouldShowV2);
      setShowProgressTableV2(shouldShowV2);
    },
    [showProgressTableV2, setShowProgressTableV2]
  );

  // If progress table is disabled, only show the v1 table.
  if (!DCDO.get('progress-table-v2-enabled', false)) {
    return <SectionProgress />;
  }

  const toggleV1OrV2Link = () => (
    <div className={styles.toggleViews}>
      <Link type="primary" size="s" onClick={onShowProgressTableV2Change}>
        {showProgressTableV2
          ? i18n.switchToOldProgressView()
          : i18n.switchToNewProgressView()}
      </Link>
    </div>
  );

  // If the user has not selected manually the v1 or v2 table, show the DCDO defined default.
  // If a user has selected manually, show that version.
  const isPreferenceSet = showProgressTableV2 !== undefined;
  const displayV2 = isPreferenceSet
    ? showProgressTableV2
    : DCDO.get('progress-table-v2-default-v2', false);
  return (
    <div>
      {toggleV1OrV2Link()}
      {displayV2 ? <SectionProgressV2 /> : <SectionProgress />}
    </div>
  );
}

SectionProgressSelector.propTypes = {
  showProgressTableV2: PropTypes.bool,
  setShowProgressTableV2: PropTypes.func.isRequired,
};

export const UnconnectedSectionProgressSelector = SectionProgressSelector;

export default connect(
  state => ({showProgressTableV2: state.currentUser.showProgressTableV2}),
  dispatch => ({
    setShowProgressTableV2: showProgressTableV2 =>
      dispatch(setShowProgressTableV2(showProgressTableV2)),
  })
)(SectionProgressSelector);
