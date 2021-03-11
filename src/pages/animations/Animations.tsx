import React, { Component } from "react";
import { Button, InputNumber, Typography } from "antd";
import { SketchPicker, ColorResult } from "react-color";

import DieScene from "../../components/DieScene";

import D20 from "../../components/D20";
import D6 from "../../components/D6";
import BasicPageLayout from "../../components/BasicPageLayout";
import TimelinePanel from "./TimelinePanel";

const BLACK = [255, 2, 2];

const DIE_SIDES = 20;

export type Props = {};

type Color = {
  r: number;
  g: number;
  b: number;
};

type AnimationSection = {
  timing: number; // in ms
  duration: number; // in ms
  color: Color;
};

type AnimationData = {
  sections: AnimationSection[];
};

type State = {
  animationDuration: number;
  tempAnimationDuration: number;
  animationData: AnimationData[];
  dieColor: { r: number; g: number; b: number };
  showDieColorPicker: boolean;
};

export default class AnimationEditor extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      animationDuration: 2000,
      tempAnimationDuration: 2000,
      animationData: new Array(DIE_SIDES).fill(0).map(() => ({ sections: [] })),
      dieColor: { r: 20, g: 20, b: 20 },
      showDieColorPicker: false,
    };
  }

  onAnimationDurationChange = (value: number | string | undefined) => {
    if (typeof value === "number") {
      this.setState({ tempAnimationDuration: value });
    }
  };

  onAnimationDurationSet = () => {
    console.log(this.state.tempAnimationDuration);
    this.setState(({ tempAnimationDuration }) => ({
      animationDuration: tempAnimationDuration,
    }));
  };

  compileAnimationDataForRendering = (): {
    times: number[];
    colors: number[];
  }[] => {
    // this assumes that none of the data given is overlapping
    const { animationData, animationDuration } = this.state;

    const finalData: { times: number[]; colors: number[] }[] = new Array(20)
      .fill(0)
      .map(() => ({ times: [], colors: [] }));

    animationData.forEach((data, i) => {
      if (data.sections.length > 0) {
        data.sections.forEach((section, secIndex) => {
          if (secIndex === 0) {
            if (section.timing !== 0) {
              finalData[i].times.push(0);
              finalData[i].colors.push(...BLACK);
            }
          } else {
            const prevSection = data.sections[secIndex - 1];
            if (
              prevSection.timing + prevSection.duration <
              section.timing - 50
            ) {
              finalData[i].times.push(
                (prevSection.timing + prevSection.duration) / 1000
              );
              finalData[i].colors.push(...BLACK);
            }
          }
          finalData[i].times.push(section.timing / 1000);
          finalData[i].colors.push(
            section.color.r,
            section.color.g,
            section.color.b
          );
        });
        const lastSection = data.sections[data.sections.length - 1];
        if (lastSection.timing + lastSection.duration < animationDuration) {
          finalData[i].times.push(
            (lastSection.timing + lastSection.duration) / 1000
          );
          finalData[i].colors.push(...BLACK);
        }
      } else {
        finalData[i].times.push(0);
        finalData[i].colors.push(...BLACK);
      }
    });

    return finalData;
  };

  handleDieColorPickerClick = () => {
    this.setState(({ showDieColorPicker }) => ({
      showDieColorPicker: !showDieColorPicker,
    }));
  };

  handleDieColorPickerClose = () => {
    this.setState({ showDieColorPicker: false });
  };

  onDieColorChange = (color: ColorResult) => {
    this.setState({ dieColor: color.rgb });
  };

  render() {
    const compiledAnimation = this.compileAnimationDataForRendering();
    return (
      <BasicPageLayout>
        <div
          style={{ height: "100%", width: "100%", backgroundColor: "#000000" }}
        >
          <div
            style={{ height: "300px", display: "flex", flexDirection: "row" }}
          >
            <div style={{ flex: 1 }}>
              <Typography>Animation Duration (ms)</Typography>
              <InputNumber
                min={100}
                max={30000}
                defaultValue={2000}
                onChange={this.onAnimationDurationChange}
              />
              <Button
                style={{ marginTop: -20 }}
                onClick={this.onAnimationDurationSet}
              >
                Set
              </Button>
              <div>
                <Typography>Die Color</Typography>
                <Button onClick={this.handleDieColorPickerClick}>
                  <div
                    style={{
                      height: 15,
                      width: 30,
                      background: `rgb(${this.state.dieColor.r}, ${this.state.dieColor.g}, ${this.state.dieColor.b})`,
                    }}
                  ></div>
                </Button>
                {this.state.showDieColorPicker && (
                  <div
                    className="colorPicker"
                    style={{ position: "absolute", zIndex: 2 }}
                  >
                    <div
                      style={{
                        position: "fixed",
                        top: 0,
                        right: 0,
                        left: 0,
                        bottom: 0,
                      }}
                      onClick={this.handleDieColorPickerClose}
                    ></div>
                    <SketchPicker
                      disableAlpha
                      color={this.state.dieColor}
                      onChange={this.onDieColorChange}
                      styles={{
                        default: {
                          picker: {
                            background: "#000",
                            border: "solid 1px white",
                            color: "black",
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div style={{ height: "100%", width: "500px" }}>
              <DieScene>
                <D20
                  animations={compiledAnimation}
                  animationDuration={this.state.animationDuration / 1000}
                  dieColor={this.state.dieColor}
                />
                {/* <D6 animations={[]} animationDuration={1} /> */}
              </DieScene>
            </div>
          </div>
          {/* Editor Pane */}
          <TimelinePanel />
        </div>
      </BasicPageLayout>
    );
  }
}
