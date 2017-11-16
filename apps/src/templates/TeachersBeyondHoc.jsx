import React, { Component, PropTypes } from 'react';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import Responsive from '../responsive';
import VerticalImageResourceCard from './VerticalImageResourceCard';
import ResourceCardResponsiveContainer from './studioHomepages/ResourceCardResponsiveContainer';

const styles = {
  heading: {
    width: '100%'
  },
  clear: {
    clear: 'both'
  },
  spacer: {
    height: 50,
  },
};

export default class TeachersBeyondHoc extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired,
  };

  render() {
    const { isRtl, responsive } = this.props;
    const desktop = (responsive.isResponsiveCategoryActive('lg') || responsive.isResponsiveCategoryActive('md'));

    const codeorgTeacherImage = desktop ? "codeorg-teacher" : "course-catalog";
    const thirdPartyTeacherImage = desktop ? "third-party-teacher" : "third-party-teacher-small";
    const thirdPartyTeacherTitle = desktop ? i18n.congratsTeacherExternalTitle() : i18n.congratsTeacherExternalTitleShort();

    const cards = [
      {
        title: i18n.congratsTeacherCodeOrgTitle(),
        description: i18n.congratsTeacherCodeOrgDesc(),
        buttonText: i18n.congratsTeacherCodeOrgButton(),
        link: "/courses?view=teacher",
        image: codeorgTeacherImage
      },
      {
        title: thirdPartyTeacherTitle,
        description: i18n.congratsTeacherExternalDesc(),
        buttonText: i18n.congratsTeacherExternalButton(),
        link: '/educate/curriculum/3rd-party',
        image: thirdPartyTeacherImage
      }
    ];

    return (
      <div>
        <h1 style={styles.heading}>
          {i18n.congratsTeacherHeading()}
        </h1>
        <ResourceCardResponsiveContainer responsive={responsive}>
          {cards.map(
            (card, cardIndex) => (
              <VerticalImageResourceCard
                key={cardIndex}
                title={card.title}
                description={card.description}
                buttonText={card.buttonText}
                link={pegasus(`/${card.link}`)}
                isRtl={isRtl}
                jumbo={desktop}
                image={card.image}
              />
            )
          )}
        </ResourceCardResponsiveContainer>
        <div style={styles.clear}/>
        {!desktop && (
          <div style={styles.spacer}/>
        )}
      </div>
    );
  }
}
