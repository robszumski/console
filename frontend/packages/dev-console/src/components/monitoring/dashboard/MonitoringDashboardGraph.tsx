import * as React from 'react';
import { QueryBrowser } from '@console/internal/components/monitoring/query-browser';
import { Humanize } from '@console/internal/components/utils';
import { ByteDataTypes } from '@console/shared/src/graph-helper/data-utils';
import { PrometheusGraphLink } from '@console/internal/components/graphs/prometheus-graph';
import './MonitoringDashboardGraph.scss';

export enum GraphTypes {
  area = 'Area',
  line = 'Line',
}

interface MonitoringDashboardGraphProps {
  title: string;
  query: string;
  namespace: string;
  graphType?: GraphTypes;
  humanize: Humanize;
  byteDataType: ByteDataTypes;
}

const defaultTimespan = 30 * 60 * 1000;

const MonitoringDashboardGraph: React.FC<MonitoringDashboardGraphProps> = ({
  query,
  namespace,
  title,
  graphType = GraphTypes.area,
}) => {
  return (
    <div className="odc-monitoring-dashboard-graph">
      <h5>{title}</h5>
      <PrometheusGraphLink query={query}>
        <QueryBrowser
          hideControls
          defaultTimespan={defaultTimespan}
          namespace={namespace}
          queries={[query]}
          isStack={graphType === GraphTypes.area}
        />
      </PrometheusGraphLink>
    </div>
  );
};

export default MonitoringDashboardGraph;
