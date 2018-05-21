// @flow
import * as React from 'react';
import { StyleSheet, View, TextInput as TextInputNative } from 'react-native';
import withTheme, { type Theme } from './withTheme';
import colorLib from 'color';
import Text from './Text';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import ErrorMessage, { type MessageError } from './ErrorMessage';

export type TextInputProps = {|
  disabled?: boolean,
  label?: string | React.Element<any>,
  error?: ?MessageError,
  size?: number,
  style?: TextStyleProp,
  value?: string,
  doNotRenderError?: boolean,
  focusOnError?: ?Object,
  secureTextEntry?: boolean,
  placeholder?: string,
  onChangeText: string => void,
  name?: string,
  keyboardType?: string,
  autoComplete?: string,
  // Feel free to add any missing prop.
|};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
  },
});

const TextInputLabel = ({ label, size }) =>
  typeof label === 'string' ? (
    <Text bold size={size}>
      {label}
    </Text>
  ) : (
    label
  );

// That's because TextInputProps is exported to reuse.
type TextInputPropsWithTheme = {|
  ...TextInputProps,
  theme: Theme,
|};

class TextInput extends React.PureComponent<TextInputPropsWithTheme> {
  componentDidUpdate(prevProps) {
    this.maybeFocusOnError(prevProps);
  }

  maybeFocusOnError(prevProps) {
    const doFocus =
      this.props.error != null &&
      // Simple trick not trick. Validation creates a new object, which we can
      // use to detect whether validation happen, therefore, focus this input.
      // Otherwise, we would have to expose input ref and maintain list of
      // focusable fields in form with switch with manual mapping... omg.
      this.props.focusOnError !== prevProps.focusOnError;
    if (!doFocus || !this.inputRef.current) return;
    this.inputRef.current.focus();
  }

  inputRef = React.createRef();

  render() {
    const {
      doNotRenderError,
      disabled,
      label,
      error,
      size = 0,
      style,
      theme,
      focusOnError,
      ...props
    } = this.props;

    const renderHeader = label != null || error != null;
    const placeholderTextColor = colorLib(theme.colors[theme.textColor]).fade(
      0.5,
    );

    return (
      <View>
        {renderHeader && (
          <View style={styles.header}>
            {label != null && <TextInputLabel label={label} size={size} />}
            {doNotRenderError !== true &&
              error != null && (
                <>
                  <Text> </Text>
                  <ErrorMessage size={size} error={error} />
                </>
              )}
          </View>
        )}
        <TextInputNative
          disabled={disabled}
          placeholderTextColor={placeholderTextColor.toString()}
          style={[
            theme.styles.textInput,
            theme.typography.fontSizeWithLineHeight(size),
            style,
          ]}
          ref={this.inputRef}
          {...props}
        />
      </View>
    );
  }
}

export default withTheme(TextInput);
