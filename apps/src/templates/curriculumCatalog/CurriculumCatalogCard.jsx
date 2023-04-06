import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import {
  translatedCourseOfferingCsTopics,
  translatedCourseOfferingSchoolSubjects,
  translatedCourseOfferingDurations
} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';
import style from './curriculum_catalog_card.module.scss';

// TODO [MEG]: remove this placeholder and require() syntax once images are pulled
const tempImage = require('@cdo/static/resource_cards/anotherhoc.png');

const CurriculumCatalogCard = ({
  courseDisplayName,
  duration,
  youngestGrade,
  oldestGrade,
  imageAltText,
  imageSrc,
  subjects,
  topics,
  isTranslated
}) => (
  <CustomizableCurriculumCatalogCard
    assignButtonText={i18n.assign()}
    assignButtonDescription={i18n.assignDescription({
      course_name: courseDisplayName
    })}
    courseDisplayName={courseDisplayName}
    duration={translatedCourseOfferingDurations[duration]}
    gradeRange={i18n.gradeRange({
      youngest_grade: youngestGrade,
      oldest_grade: oldestGrade
    })} // TODO [MEG]: Decide on translation strategy for this
    imageSrc={imageSrc}
    subjectsAndTopics={[
      ...subjects.map(
        subject => translatedCourseOfferingSchoolSubjects[subject]
      ),
      ...topics.map(topic => translatedCourseOfferingCsTopics[topic])
    ]}
    quickViewButtonDescription={i18n.quickViewDescription({
      course_name: courseDisplayName
    })}
    quickViewButtonText={i18n.quickView()}
    imageAltText={imageAltText}
    isTranslated={isTranslated}
    translationIconTitle={i18n.courseInYourLanguage()}
  />
);

CurriculumCatalogCard.propTypes = {
  courseDisplayName: PropTypes.string.isRequired,
  duration: PropTypes.oneOf(Object.keys(translatedCourseOfferingDurations))
    .isRequired,
  youngestGrade: PropTypes.number,
  oldestGrade: PropTypes.number,
  imageAltText: PropTypes.string,
  imageSrc: PropTypes.string.isRequired,
  isTranslated: PropTypes.bool,
  subjects: PropTypes.arrayOf(
    PropTypes.oneOf(Object.keys(translatedCourseOfferingSchoolSubjects))
  ).isRequired,
  topics: PropTypes.arrayOf(
    PropTypes.oneOf(Object.keys(translatedCourseOfferingCsTopics))
  ).isRequired
};

CurriculumCatalogCard.defaultProps = {
  imageSrc: tempImage, // TODO [MEG]: remove this default once images are pulled
  imageAltText: '', // for decorative images
  isTranslated: false
};

const CustomizableCurriculumCatalogCard = ({
  assignButtonDescription,
  assignButtonText,
  courseDisplayName,
  duration,
  gradeRange,
  imageAltText,
  imageSrc,
  isTranslated,
  translationIconTitle,
  subjectsAndTopics,
  quickViewButtonDescription,
  quickViewButtonText
}) => (
  <div className={style.curriculumCatalogCardContainer}>
    <img src={imageSrc} alt={imageAltText} />
    <div className={style.curriculumInfoContainer}>
      {/*TODO [MEG]: Show all subjects and topics rather than only the first one */}
      <div className={style.tagsAndTranslatabilityContainer}>
        <p className={style.overline}>{subjectsAndTopics[0]}</p>
        {/*TODO [MEG]: Ensure this icon matches spec when we update FontAwesome */}
        {isTranslated && (
          <FontAwesome
            icon="language"
            className="fa-solid"
            title={translationIconTitle}
          />
        )}
      </div>
      <h4>{courseDisplayName}</h4>
      <div className={style.iconWithDescription}>
        <FontAwesome icon="user" className="fa-solid" />
        <p className={style.iconDescription}>{gradeRange}</p>
      </div>
      <div className={style.iconWithDescription}>
        {/*TODO [MEG]: Update this to be clock fa-solid when we update FontAwesome */}
        <FontAwesome icon="clock-o" />
        <p className={style.iconDescription}>{duration}</p>
      </div>
      <div className={style.buttonsContainer}>
        {/* each button should be same fixed size */}
        <Button
          color={Button.ButtonColor.neutralDark}
          type="button"
          onClick={() => {}}
          aria-label={quickViewButtonDescription}
        >
          {quickViewButtonText}
        </Button>
        <Button
          color={Button.ButtonColor.brandSecondaryDefault}
          type="button"
          onClick={() => {}}
          aria-label={assignButtonDescription}
        >
          {assignButtonText}
        </Button>
      </div>
    </div>
  </div>
);

CustomizableCurriculumCatalogCard.propTypes = {
  courseDisplayName: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  gradeRange: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  isTranslated: PropTypes.bool,
  translationIconTitle: PropTypes.string.isRequired,
  subjectsAndTopics: PropTypes.arrayOf(PropTypes.string).isRequired,
  quickViewButtonText: PropTypes.string.isRequired,
  assignButtonText: PropTypes.string.isRequired,

  // for screenreaders
  imageAltText: PropTypes.string,
  quickViewButtonDescription: PropTypes.string.isRequired,
  assignButtonDescription: PropTypes.string.isRequired
};

export default CurriculumCatalogCard;
