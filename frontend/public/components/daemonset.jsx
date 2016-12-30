import React from 'react';

import {makeDetailsPage, makeListPage, makeList} from './factory';
import {Cog, LabelList, ResourceCog, ResourceLink, Selector, Timestamp, navFactory, detailsPage} from './utils';

const DaemonSetHeader = () => <div className="row co-m-table-grid__head">
  <div className="col-lg-3 col-md-3 col-sm-3 col-xs-6">Name</div>
  <div className="col-lg-3 col-md-3 col-sm-5 col-xs-6">Labels</div>
  <div className="col-lg-3 col-md-3 col-sm-4 hidden-xs">Status</div>
  <div className="col-lg-3 col-md-3 hidden-sm hidden-xs">Node Selector</div>
</div>;

const DaemonSetRow = ({obj: daemonset}) => <div className="row co-resource-list__item">
  <div className="col-lg-3 col-md-3 col-sm-3 col-xs-12">
    <ResourceCog actions={[Cog.factory.ModifyLabels, Cog.factory.Delete]} kind="daemonset" resource={daemonset} />
    <ResourceLink kind="daemonset" name={daemonset.metadata.name} namespace={daemonset.metadata.namespace} title={daemonset.metadata.uid} />
  </div>
  <div className="col-lg-3 col-md-3 col-sm-5 col-xs-6">
    <LabelList kind="daemonset" labels={daemonset.metadata.labels} />
  </div>
  <div className="col-lg-3 col-md-3 col-sm-4 hidden-xs">
    <a href={`ns/${daemonset.metadata.namespace}/daemonsets/${daemonset.metadata.name}/pods`} title="pods">
      {daemonset.status.currentNumberScheduled} of {daemonset.status.desiredNumberScheduled} pods
    </a>
  </div>
  <div className="col-lg-3 col-md-3 hidden-sm hidden-xs">
    <Selector selector={daemonset.spec.selector.matchLabels} />
  </div>
</div>;

const Details = (daemonset) => <div>
  <div className="col-lg-6">
    <div className="co-m-pane">
      <div className="co-m-pane__body">
        <dl>
          <dt>Name</dt>
          <dd>{daemonset.metadata.name || '-'}</dd>
          <dt>Labels</dt>
          <dd><LabelList kind="daemonset" labels={daemonset.metadata.labels} /></dd>
          <dt>Pod Selector</dt>
          <dd><Selector selector={daemonset.spec.selector.matchLabels} expand={true} /></dd>
          <dt>Created At</dt>
          <dd><Timestamp timestamp={daemonset.metadata.creationTimestamp} /></dd>
        </dl>
      </div>
    </div>
  </div>
  <div className="col-lg-6">
    <div className="co-m-pane">
      <div className="co-m-pane__body">
        <dl>
          <dt>Current Count</dt>
          <dd>{daemonset.status.currentNumberScheduled || '-'}</dd>
          <dt>Desired Count</dt>
          <dd>{daemonset.status.desiredNumberScheduled || '-'}</dd>
        </dl>
      </div>
    </div>
  </div>
</div>;

const {details, pods, editYaml} = navFactory;
const pages = [details(detailsPage(Details)), editYaml(), pods()];

const DaemonSets = makeList('DaemonSets', 'daemonset', DaemonSetHeader, DaemonSetRow);
const DaemonSetsPage = makeListPage('DaemonSetsPage', 'daemonset', DaemonSets);
const DaemonSetsDetailsPage = makeDetailsPage('DaemonSetsDetailsPage', 'daemonset', pages);

export {DaemonSets, DaemonSetsPage, DaemonSetsDetailsPage};
