import { computed } from 'vue';

// Utils
import { createNamespace } from '../utils';
import { BORDER } from '../utils/constant';
import { STEPS_KEY, StepsProvide } from '../steps';

// Composition
import { useParent } from '@vant/use';

// Components
import Icon from '../icon';

const [createComponent, bem] = createNamespace('step');

export default createComponent({
  setup(props, { slots }) {
    const { parent, index } = useParent<StepsProvide>(STEPS_KEY);

    if (!parent) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Vant] <Step> must be a child component of <Steps>.');
      }
      return;
    }

    const parentProps = parent.props;

    const getStatus = () => {
      const active = +parentProps.active;
      if (index.value < active) {
        return 'finish';
      }
      return index.value === active ? 'process' : 'waiting';
    };

    const isActive = () => getStatus() === 'process';

    const lineStyle = computed(() => ({
      background:
        getStatus() === 'finish'
          ? parentProps.activeColor
          : parentProps.inactiveColor,
    }));

    const titleStyle = computed(() => {
      if (isActive()) {
        return { color: parentProps.activeColor };
      }
      if (!getStatus()) {
        return { color: parentProps.inactiveColor };
      }
    });

    const onClickStep = () => {
      parent.onClickStep(index.value);
    };

    const renderCircle = () => {
      const { finishIcon, activeIcon, activeColor, inactiveIcon } = parentProps;

      if (isActive()) {
        if (slots['active-icon']) {
          return slots['active-icon']();
        }

        return (
          <Icon
            class={bem('icon', 'active')}
            name={activeIcon}
            color={activeColor}
          />
        );
      }

      if (getStatus() === 'finish' && finishIcon) {
        return (
          <Icon
            class={bem('icon', 'finish')}
            name={finishIcon}
            color={activeColor}
          />
        );
      }

      if (slots['inactive-icon']) {
        return slots['inactive-icon']();
      }

      if (inactiveIcon) {
        return <Icon class={bem('icon')} name={inactiveIcon} />;
      }

      return <i class={bem('circle')} style={lineStyle.value} />;
    };

    return () => {
      const status = getStatus();

      return (
        <div
          class={[BORDER, bem([parentProps.direction, { [status]: status }])]}
        >
          <div
            class={bem('title', { active: isActive() })}
            style={titleStyle.value}
            onClick={onClickStep}
          >
            {slots.default?.()}
          </div>
          <div class={bem('circle-container')} onClick={onClickStep}>
            {renderCircle()}
          </div>
          <div class={bem('line')} style={lineStyle.value} />
        </div>
      );
    };
  },
});
