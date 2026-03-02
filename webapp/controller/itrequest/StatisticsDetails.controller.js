sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], (Controller,JSONModel) => {
  "use strict";

  return Controller.extend("vcentral.controller.itrequest.StatisticsDetails", {
      onInit() {
        this.getOwnerComponent().getRouter().getRoute("StatisticData").attachPatternMatched(this.onRouteMatched,this);
      },
      onRouteMatched:function(){
        const oModel = this.getView().getModel("RequestModel"); 
        oModel.read("/itrequestSet", 
          { success: (oData) => { 
            const aRequests = oData.results; 
            this.countRequests(aRequests);
            this.getRecentActivity(aRequests);
          }, 
          error: () => { 
            sap.m.MessageBox.error("Failed to load requests from backend"); 
          } });
        
      },
      //   Summary model has data in the form of arrays like "status": "Open", "count" :3 , "percent":80 so it will not work for table/list

    //   countRequests: function () {
    //     const oModel = this.getView().getModel("RequestModel");
    //     const aRequests = oModel.getProperty("/itrequestSet");

    //     const total = aRequests.length;

    //     let statusCounts = {};
    //     let priorityCounts = {};
    //     let categoryCounts = {};

    //     aRequests.forEach(req => {
    //         statusCounts[req.Status] = (statusCounts[req.Status] || 0) + 1;
    //         priorityCounts[req.Priority] = (priorityCounts[req.Priority] || 0) + 1;
    //         categoryCounts[req.Category] = (categoryCounts[req.Category] || 0) + 1;
    //     });

    //     // Convert to arrays with counts + percent
    //     const statusArray = Object.keys(statusCounts).map(key => ({
    //         status: key,
    //         count: statusCounts[key],
    //         percent: ((statusCounts[key] / total) * 100).toFixed(1) + "%"
    //     }));

    //     const priorityArray = Object.keys(priorityCounts).map(key => ({
    //         priority: key,
    //         count: priorityCounts[key],
    //         percent: ((priorityCounts[key] / total) * 100).toFixed(1) + "%"
    //     }));

    //     const categoryArray = Object.keys(categoryCounts).map(key => ({
    //         category: key,
    //         count: categoryCounts[key],
    //         percent: ((categoryCounts[key] / total) * 100).toFixed(1) + "%"
    //     }));

    //     // Put everything into a summary model
    //     const oSummary = new JSONModel({
    //         total,
    //         statusCounts: statusArray,
    //         priorityCounts: priorityArray,
    //         categoryCounts: categoryArray
    //     });
    //     console.log("oSummary MOdel: ",oSummary)

    //     this.getView().setModel(oSummary, "SummaryModel");
    // },
    countRequests: function (aRequests) {

  if (!aRequests || !aRequests.length) {
    sap.m.MessageToast.show("Data not loaded from Property")
    return;
  }

  const total = aRequests.length;

  let statusCounts = {};
  let priorityCounts = {};
  let categoryCounts = {};

  aRequests.forEach(req => {
    statusCounts[req.Status] = (statusCounts[req.Status] || 0) + 1;
    priorityCounts[req.Priority] = (priorityCounts[req.Priority] || 0) + 1;
    categoryCounts[req.Category] = (categoryCounts[req.Category] || 0) + 1;
  });

  // Convert to arrays for table/list binding
  const statusArray = Object.keys(statusCounts).map(key => ({
    Status: key,
    Count: statusCounts[key],
    Percent: ((statusCounts[key] / total) * 100).toFixed(1) + "%"
  }));

  const priorityArray = Object.keys(priorityCounts).map(key => ({
    Priority: key,
    Count: priorityCounts[key],
    Percent: ((priorityCounts[key] / total) * 100).toFixed(1) + "%"
  }));

  const categoryArray = Object.keys(categoryCounts).map(key => ({
    Category: key,
    Count: categoryCounts[key],
    Percent: ((categoryCounts[key] / total) * 100).toFixed(1) + "%"
  }));

  const oSummary = new JSONModel({
    Total: total,
    StatusCounts: statusArray,
    PriorityCounts: priorityArray,
    CategoryCounts: categoryArray
  });

  this.getView().setModel(oSummary, "SummaryModel");
},
  
    getRecentActivity: function (aRequests) {
      // const oModel = this.getView().getModel("RequestModel");
      // const aRequests = oModel.getProperty("/itrequestSet");

      // Sort by CreatedOn descending
      const aSorted = aRequests.sort((a, b) => {
          return new Date(b.CreatedOn) - new Date(a.CreatedOn);
      });

      // Take top 4 entries
      const aRecent = aSorted.slice(0, 4);
      aRecent.forEach(req => {
        const created = new Date(req.CreatedOn);
        const now = new Date();
        // difference in milliseconds
        const diffMs = now.getTime() - created.getTime();

        console.log("created Time:", created.getTime())
        console.log("Now Time:", now.getTime())
        console.log("Difference time: ",diffMs)
        // convert to minutes/hours/days
        const diffMinutes = Math.floor((diffMs / (1000 * 60))-545);
        if (diffMinutes < 1) {
            req.hoursAgo = "just now";
        } else if (diffMinutes < 60) {
            req.hoursAgo = diffMinutes + " minutes ago";
        } else if (diffMinutes < 24 * 60) {
            req.hoursAgo = Math.floor(diffMinutes / 60) + " hours ago";
        } else {
            req.hoursAgo = Math.floor(diffMinutes / (24 * 60)) + " days ago";
        }
          // Add "hoursAgo" property
          // const now = new Date();
          // const created = new Date(req.CreatedOn);
          // const diffMs = now.getTime() - created.getTime()
          // // now - created; difference in milliseconds
          // const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

          // if (diffHours < 24) {
          //     req.hoursAgo = diffHours + " hours ago";
          // } else {
          //     const diffDays = Math.floor(diffHours / 24);
          //     req.hoursAgo = diffDays + " days ago";
          // }
      });

      // Put into a new JSONModel
      const oRecentModel = new JSONModel({ recent: aRecent });
      this.getView().setModel(oRecentModel, "RecentModel");
    },
    back:function(){
        this.getOwnerComponent().getRouter().navTo("Routedashboard")    
      },
      onRefresh: function () {
        location.reload(); // reloads the whole app
      },
      onExport: function () {
        // Get the model data
        var oRequestModel = this.getOwnerComponent().getModel("RequestModel");
        var aData = oRequestModel.getProperty("/itrequestSet");

        // Build CSV header (exclude Actions)
        var csvContent = "ID,Category,Priority,Status,Created On\n";

        // Loop through requests and add rows
        aData.forEach(function (req) {
          csvContent += [
            req.RequestId,
            req.Category,
            req.Priority,
            req.Status,
            '"' + "'" + req.CreatedOn + '"'
            // '"' + req.CreatedOn + '"\n'
            // '"' + req.CreatedOn + '"\n"'
          ].join(",") + "\n";
        });
            console.log("csvContent :" +csvContent)
        // Create a blob and trigger download
        var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Requests.csv";
        link.click();
      },


  });
});

    //   Summary model has data in the form on objects like "Open":3 so it will not work for table/list

    //   countRequests: function () {
    //         const oModel = this.getView().getModel("RequestModel");
    //         const aRequests = oModel.getProperty("/requests");

    //         const total = aRequests.length;

    //         let statusCounts = {};
    //         let priorityCounts = {};
    //         let categoryCounts = {};

    //         aRequests.forEach(req => {
    //             // Count by status
    //             statusCounts[req.status] = (statusCounts[req.status] || 0) + 1;
    //             priorityCounts[req.priority] = (priorityCounts[req.priority] || 0) + 1;
    //             categoryCounts[req.category] = (categoryCounts[req.category] || 0) + 1;
    //         });

    //         // Convert counts to percentages
    //         const statusPercent = {};
    //         Object.keys(statusCounts).forEach(key => {
    //             statusPercent[key] = ((statusCounts[key] / total) * 100).toFixed(1) + "%";
    //         });

    //         const priorityPercent = {};
    //         Object.keys(priorityCounts).forEach(key => {
    //             priorityPercent[key] = ((priorityCounts[key] / total) * 100).toFixed(1) + "%";
    //         });

    //         const categoryPercent = {};
    //         Object.keys(categoryCounts).forEach(key => {
    //             categoryPercent[key] = ((categoryCounts[key] / total) * 100).toFixed(1) + "%";
    //         });
    //         // Put everything into a summary model
    //         const oSummary = new JSONModel({
    //             total,
    //             statusCounts,
    //             statusPercent,
    //             priorityCounts,
    //             priorityPercent,
    //             categoryCounts,
    //             categoryPercent
    //         });

    //         this.getView().setModel(oSummary, "SummaryModel");
    //     }

