import React from 'react';

import {isNodeReady} from '../module/k8s/node';
import {angulars, register} from './react-wrapper';
import {makeDetailsPage, makeList, makeListPage} from './factory';
import {SparklineWidget} from './sparkline-widget/sparkline-widget';
import {Cog, navFactory, LabelList, NavTitle, ResourceCog, ResourceHeading, ResourceLink, Timestamp, units} from './utils';

const menuActions = [Cog.factory.ModifyLabels];

const NodeIPList = ({ips, expand = false}) => <div>
  {_.sortBy(ips, ['type']).map((ip, i) => <div key={i} className="co-node-ip">
    {(expand || ip.type === 'InternalIP') && <p>
      <span className="co-ip-type">{ip.type}: </span>
      <span className="co-ip-addr">{ip.address}</span>
    </p>}
  </div>)}
</div>;

const Header = () => <div className="row co-m-table-grid__head">
  <div className="col-xs-4">Node Name</div>
  <div className="col-xs-4">Status</div>
  <div className="col-xs-4">Node Addresses</div>
</div>;

const HeaderSearch = () => <div className="row co-m-table-grid__head">
  <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">Node Name</div>
  <div className="col-md-2 hidden-sm hidden-xs">Status</div>
  <div className="col-sm-5 col-xs-7">Node Labels</div>
  <div className="col-md-2 col-sm-3 hidden-xs">Node Addresses</div>
</div>;

const NodeCog = ({node}) => <ResourceCog actions={menuActions} kind="node" resource={node} />;

const NodeStatus = ({node}) => isNodeReady(node) ? <span className="node-ready"><i className="fa fa-check"></i> Ready</span> : <span className="node-not-ready"><i className="fa fa-minus-circle"></i> Not Ready</span>;

const NodeRow = ({obj: node, expand}) => <div className="row co-resource-list__item">
  <div className="middler">
    <div className="col-xs-4">
      <NodeCog node={node} />
      <ResourceLink kind="node" name={node.metadata.name} title={node.metadata.uid} />
    </div>
    <div className="col-xs-4">
      <NodeStatus node={node} />
    </div>
    <div className="col-xs-4">
      <NodeIPList ips={node.status.addresses} expand={expand} />
    </div>
  </div>
  {expand && <div className="col-xs-12">
    <LabelList kind="node" labels={node.metadata.labels} />
  </div>}
</div>;

const NodeRowSearch = ({obj: node}) => <div className="row co-resource-list__item">
  <div className="col-lg-2 col-md-3 col-sm-4 col-xs-5">
    <NodeCog node={node} />
    <ResourceLink kind="node" name={node.metadata.name} title={node.metadata.uid} />
  </div>
  <div className="col-md-2 hidden-sm hidden-xs">
    <NodeStatus node={node} />
  </div>
  <div className="col-sm-5 col-xs-7">
    <LabelList kind="node" labels={node.metadata.labels} dontExpand={true} />
  </div>
  <div className="col-md-2 col-sm-3 hidden-xs">
    <NodeIPList ips={node.status.addresses} />
  </div>
</div>;

const NodesPage = () => <div className="co-p-nodes">
  <NavTitle title="Nodes" />
  <NodesListPage canExpand={true} />
</div>;

// We have different list layouts for the Nodes page list and the Search page list
const NodesList = makeList('Nodes', 'node', Header, NodeRow);
const NodesListSearch = makeList('Nodes', 'node', HeaderSearch, NodeRowSearch);

const dropdownFilters = [{
  type: 'node-status',
  items: {
    all: 'Status: All',
    ready: 'Status: Ready',
    notReady: 'Status: Not Ready',
  },
  title: 'Ready Status',
}];
const NodesListPage = makeListPage('NodesPage', 'node', NodesList, dropdownFilters);

const Details = (node) => {
  const nodeIp = _.find(node.status.addresses, {type: 'InternalIP'});
  const ipQuery = nodeIp && `{instance=~'.*${nodeIp.address}.*'}`;

  const memoryLimit = units.dehumanize(node.status.allocatable.memory, 'binaryBytesWithoutB').value;

  const integerLimit = input => parseInt(input, 10);

  return <div>
    <ResourceHeading resourceName="Node" />
    <div className="co-m-pane__body">
      <div className="row">
        <div className="col-xs-12">
          <div className="co-sparkline-wrapper">
            <div className="row no-gutter">
              <div className="col-md-4">
                <SparklineWidget heading="RAM" query={ipQuery && `node_memory_Active${ipQuery}`} units="binaryBytes" limit={memoryLimit} />
              </div>
              <div className="col-md-4">
                <SparklineWidget heading="CPU" query={ipQuery && `instance:node_cpu:rate:sum${ipQuery}`} units="numeric" limit={integerLimit(node.status.allocatable.cpu)} />
              </div>
              <div className="col-md-4">
                <SparklineWidget heading="Number of Pods" query={`kubelet_running_pod_count{instance=~'.*${node.metadata.name}.*'}`} units="numeric" limit={integerLimit(node.status.allocatable.pods)} />
              </div>
              <div className="col-md-4">
                <SparklineWidget heading="Network In" query={ipQuery && `instance:node_network_receive_bytes:rate:sum${ipQuery}`} units="decimalBytes" />
              </div>
              <div className="col-md-4">
                <SparklineWidget heading="Network Out" query={ipQuery && `instance:node_network_transmit_bytes:rate:sum${ipQuery}`} units="decimalBytes" />
              </div>
              <div className="col-md-4">
                <SparklineWidget heading="Filesystem" query={ipQuery && `instance:node_filesystem_usage:sum${ipQuery}`} units="decimalBytes" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xs-12">
          <dl>
            <dt>Node Name</dt>
            <dd>{node.metadata.name || '-'}</dd>
            <dt>Node ID</dt>
            <dd>{_.get(node, 'spec.externalID', '-')}</dd>
            <dt>Node Addresses</dt>
            <dd><NodeIPList ips={_.get(node, 'status.addresses')} /></dd>
            <dt>Node Labels</dt>
            <dd><LabelList kind="node" expand={true} labels={node.metadata.labels} /></dd>
            <dt>Created</dt>
            <dd><Timestamp timestamp={node.metadata.creationTimestamp} /></dd>
          </dl>
        </div>
        <div className="col-md-6 col-xs-12">
          <dl>
            <dt>Kernel Version</dt>
            <dd>{_.get(node, 'status.nodeInfo.kernelVersion', '-')}</dd>
            <dt>Boot ID</dt>
            <dd>{_.get(node, 'status.nodeInfo.bootID', '-')}</dd>
            <dt>Container Runtime</dt>
            <dd>{_.get(node, 'status.nodeInfo.containerRuntimeVersion', '-')}</dd>
            <dt>Kubelet Version</dt>
            <dd>{_.get(node, 'status.nodeInfo.kubeletVersion', '-')}</dd>
            <dt>Kube-Proxy Version</dt>
            <dd>{_.get(node, 'status.nodeInfo.kubeProxyVersion', '-')}</dd>
          </dl>
        </div>
      </div>
    </div>

    <div className="co-m-pane__body">
      <div className="row">
        <div className="col-xs-12">
          <h1 className="co-section-title">Node Conditions</h1>
          <div className="co-table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Updated</th>
                  <th>Changed</th>
                </tr>
              </thead>
              <tbody>
                {node.status.conditions.map(c => <tr key={_.uniqueId()}>
                  <td>{c.type}</td>
                  <td>{c.status || '-'}</td>
                  <td>{c.reason || '-'}</td>
                  <td><Timestamp timestamp={c.lastHeartbeatTime} /></td>
                  <td><Timestamp timestamp={c.lastTransitionTime} /></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>;
};

const {details, editYaml, events, pods} = navFactory;
const pages = [details(Details), editYaml(), pods(), events()];
const NodeDetailsPage_ = makeDetailsPage('NodeDetailsPage', 'node', pages, menuActions);
const NodeDetailsPage = () => <NodeDetailsPage_ kind="node" name={angulars.routeParams.name} />;

export {NodeDetailsPage, NodesList, NodesListSearch, NodesPage};
register('NodesPage', NodesPage);
register('NodeDetailsPage', NodeDetailsPage);
