import {Component, OnInit} from '@angular/core';
import {NetMetricsService} from '../../services/net.metrics/net.metrics.service';
import {SharedService} from '../../services/net.metrics/shared.service';
import {NMNetwork} from '../../models/NMNetwork';
import {Link, Node} from '../../services/d3/models';
import {NMRestructuredData} from '../../models/NMRestructuredData';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  public currentMetrics: any;
  public restructuredData: NMRestructuredData;
  public numUniqueUsers = 0;
  public numNetworks = 0;
  public numTotalChannels = 0;
  public largestNetworks: Array<NMNetwork>;
  public busiestNetworks: Array<NMNetwork>;
  public nodes: Array<Node> = [];
  public links: Array<Link> = [];
  public largestTokenDisp = true;
  public busiestTokenDisp = false;
  public refreshToggle = true;
  public warningMsg: object = null;

  constructor(private netMetricsService: NetMetricsService, private sharedService: SharedService) {
    // this.updateMetrics();
  }

  ngOnInit() {
    this.updateMetrics();
    // setTimeout(a=>{ this.showLargestNetworks, console.log('this.showLargestNetworks'); }, 3000);
  }

  /*  Get data from server and update local values. 
  */
  public updateMetrics() {
    const that = this;

    // Update local metric variables from the nmservice:
    const _updMetrics = ()=>{
      that.currentMetrics = that.netMetricsService.getCurrentMetrics();
      that.netMetricsService.updateTotalsAndComparativeMetrics();
      that.numUniqueUsers = that.netMetricsService.getNumUniqueUsers();
      that.numNetworks = that.netMetricsService.getNumNetworks();
      that.numTotalChannels = that.netMetricsService.getTotalChannels();
      that.largestNetworks = that.netMetricsService.getLargestNetworks();
      that.busiestNetworks = that.netMetricsService.getBusiestNetworks();
    };

    // Update d3 chart/graph data from service:
    // (no need for promise; refactor to sequence)
    const _updGraphData = ()=>{
      const rsData: NMRestructuredData = that.netMetricsService.restructureAndPersistData();
      // console.log('_updGraphData', rsData);
      this.restructuredData = rsData;
      that.initGraphData();
    };

    // Get metrics from server,then update local values:
    // (should be done by service, not component; refactor)
    const _getMetrics = ()=>{
      that.netMetricsService.updateCurrentMetrics()
      .then((res: any) => {
        that.showWarning(null, null); 
        _updMetrics();
        _updGraphData();
      }).catch(e=>{
        console.log('Error getting metrics: ', e);
        that.showWarning("Error", `Error getting data: "${e.body.message}"`);
      });
    }

    // Do it now and at interval:
    // (temp: clears interval after a while to spare server)
    _getMetrics();
    const si = setInterval(_getMetrics, 3000);
    // setTimeout(a=>{ clearInterval(si) }, 5e3);

  } // updateMetrics

  /*  Show a warning message. Parameters are title and body strings. 
      To close the message, pass in falsy parameters (null or "") */
  public showWarning(title:string, body:string) {
    title && body ? this.warningMsg = { title, body } : this.warningMsg = null;
  }
  /*  Set values to show/hide correct view */
  public showLargestNetworks() {
    this.largestTokenDisp = true;
    this.busiestTokenDisp = false;
  }

  /*  Set values to show/hide correct view */
  public showBusiestNetworks() {
    this.largestTokenDisp = false;
    this.busiestTokenDisp = true;
  }

  /*  Get data for d3 chart. Sets local `nodes` and `links` values. 
      Uses `netMetricsService.retrievePersistedDataForGraph`. 
  */
  public initGraphData() {
    const that = this;
    const persistedData: NMRestructuredData = that.netMetricsService.retrievePersistedDataForGraph();
    // console.log('initGraphData: persistedData', persistedData);
    const psuedoNodes = persistedData['nodes'];
    const pseudoLinks = persistedData['links'];
    that.nodes = [];
    that.links = [];
    // Instantiate real Node instances iso literal object:
    for (const pseudoNode of psuedoNodes) {
      const node = new Node(pseudoNode['id']);
      // const node = new Node(pseudoNode['address']); // Here's where the bug is at: 'id' iso 'address'
      node.x = Math.floor(Math.random() * 600) + 100;
      node.y = Math.floor(Math.random() * 600) + 100;
      node.linkCount = pseudoNode['numChannels'];
      that.nodes.push(node);
    }
    // Get the real Node instance iso literal object:
    for (const pseudoLink of pseudoLinks) {
      // const link = new Link(pseudoLink['source'], pseudoLink['target']);
      const src = that.getMatchingNode(pseudoLink['source'], that.nodes),
        trg = that.getMatchingNode(pseudoLink['target'], that.nodes);
      // Only add link if match:
      if(src && trg){
        const link = new Link(src, trg);
        that.links.push(link);
      }
    }
  }

  /*  Return the node matching the provided address:
  */
  public getMatchingNode(address: string, nodes: Array<Node>) {
    let res: Node;
    for (const node of nodes) {
      if (address === node.id) {
        res = node;
        break;
      }
    }
    return res;
  }

  public scrollToA(loc: string) {
    document.getElementById(loc).scrollIntoView();
  }
}
