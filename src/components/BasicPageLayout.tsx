import React from "react";
import { Layout, Menu, Breadcrumb } from "antd";

const { Content, Sider } = Layout;

type Props = {
  breadcrumbs: string[];
};

type State = {
  collapsed: boolean;
};

class BasicPageLayout extends React.Component<Props, State> {
  static defaultProps = {
    breadcrumbs: [],
  };

  state = {
    collapsed: false,
  };

  onCollapse = (collapsed: boolean) => {
    console.log(collapsed);
    this.setState({ collapsed });
  };

  render() {
    return (
      <Layout style={{ minHeight: "100%" }}>
        <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
        >
          <div className="logo" />
          <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
            <Menu.Item key="1">Dice Discovery</Menu.Item>
            <Menu.Item key="2">My Dice</Menu.Item>
            <Menu.Item key="3">Animations</Menu.Item>
            <Menu.Item key="4">Roll Broadcaster</Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Content style={{ margin: "0 16px" }}>
            {this.props.breadcrumbs && this.props.breadcrumbs.length > 0 && (
              <Breadcrumb style={{ margin: "16px 0" }}>
                {this.props.breadcrumbs.map((str, i) => (
                  <Breadcrumb.Item key={`${i}${str}`}>{str}</Breadcrumb.Item>
                ))}
              </Breadcrumb>
            )}

            <div
              className="site-layout-background"
              style={{ padding: 24, minHeight: 360 }}
            >
              {this.props.children}
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default BasicPageLayout;
