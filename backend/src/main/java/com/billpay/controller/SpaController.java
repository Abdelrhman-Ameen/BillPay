package com.billpay.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({"/", "/login", "/register", "/dashboard", "/history", "/admin"})
    public String forwardAngularRoutes() {
        return "forward:/index.html";
    }
}
