USE [planlekcji]
GO

SELECT 
	Classes.class_id,
	group_number,
	type_name,
	Employees.first_name +' '+ Employees.last_name AS prowadzacy,
	Classes_dates.date,
	start_time,
	end_time,
	room_number,
	Department.name AS room_department_name,
	state_name
  FROM Schedules
  JOIN Classes ON Schedules.schedule_id = Classes.schedule_id
  JOIN Classes_dates ON Classes_dates.class_id =  Classes.class_id
  JOIN Rooms ON Rooms.room_id = Classes_dates.room_id
  JOIN Department ON Department.department_id = Rooms.department_id
  JOIN Classes_state ON Classes_state.class_state_id = Classes_dates.state_id
  JOIN Employees ON Employees.employee_id = Classes.employee_id
  JOIN Groups ON Groups.group_id = Classes.group_id
  JOIN Groups_type ON Groups_type.group_type_id = Groups.group_type_id
  WHERE Schedules.schedule_id = 1;

GO


